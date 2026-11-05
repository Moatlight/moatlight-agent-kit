"""Moatlight API client. Standard library only.

Writes carry an Idempotency-Key that stays the same across retries, and network errors, 429 and 5xx are
retried (Retry-After honoured), so a retry can never start a second report.
"""
from __future__ import annotations

import json
import random
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any, Dict, Iterator, List, Optional

__version__ = "1.1.0"
DEFAULT_BASE_URL = "https://www.moatlight.com"
__all__ = ["Moatlight", "MoatlightError", "DEFAULT_BASE_URL", "__version__"]


class MoatlightError(Exception):
    """An API error: HTTP status plus the code, message and hint from the JSON error body."""

    def __init__(self, status: int, code: str, message: str, hint: Optional[str] = None,
                 retry_after: Optional[int] = None, body: Any = None) -> None:
        super().__init__(f"{code}: {message}")
        self.status, self.code, self.message, self.hint = status, code, message, hint
        self.retry_after, self.body = retry_after, body


class Moatlight:
    def __init__(self, token: Optional[str] = None, base_url: str = DEFAULT_BASE_URL,
                 max_retries: int = 3, timeout: float = 60.0) -> None:
        self.token = token
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries
        self.timeout = timeout
        #: RateLimit headers of the last answer: {"limit", "remaining", "reset_seconds"}
        self.last_rate_limit: Dict[str, Optional[int]] = {}

    # ---- transport ----
    def request(self, path: str, method: str = "GET", query: Optional[Dict[str, Any]] = None,
                body: Any = None, idempotency_key: Optional[str] = None) -> Any:
        url = self.base_url + path
        params = {k: v for k, v in (query or {}).items() if v is not None}
        if params:
            url += "?" + urllib.parse.urlencode(params)
        headers = {"Accept": "application/json", "User-Agent": f"moatlight-python/{__version__}"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        if method == "POST":
            headers["Idempotency-Key"] = idempotency_key or str(uuid.uuid4())
        attempt = 0
        while True:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as res:
                    self._rate(res.headers)
                    text = res.read().decode()
                    return json.loads(text) if text else None
            except urllib.error.HTTPError as e:
                self._rate(e.headers)
                text = e.read().decode()
                try:
                    payload = json.loads(text)
                except ValueError:
                    payload = None
                retry_after = int(e.headers.get("Retry-After") or 0) or None
                if (e.code == 429 or e.code >= 500) and attempt < self.max_retries:
                    time.sleep(min(retry_after, 60) if retry_after else _backoff(attempt))
                    attempt += 1
                    continue
                err = (payload or {}).get("error", {}) if isinstance(payload, dict) else {}
                raise MoatlightError(e.code, err.get("code", f"http_{e.code}"), err.get("message", e.reason),
                                     err.get("hint"), retry_after, payload) from None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                if attempt >= self.max_retries:
                    raise
                time.sleep(_backoff(attempt))
                attempt += 1

    def _rate(self, h: Any) -> None:
        def num(k: str) -> Optional[int]:
            v = h.get(k)
            return int(v) if v is not None and str(v).isdigit() else None
        self.last_rate_limit = {"limit": num("RateLimit-Limit"), "remaining": num("RateLimit-Remaining"),
                                "reset_seconds": num("RateLimit-Reset")}

    # ---- public ----
    def get_product(self, fields: Optional[str] = None) -> Dict[str, Any]:
        return self.request("/api/v1/product", query={"fields": fields})

    def get_pricing(self, fields: Optional[str] = None) -> Dict[str, Any]:
        return self.request("/api/v1/pricing", query={"fields": fields})

    def get_sample_report(self) -> Dict[str, Any]:
        return self.request("/api/v1/sample-report")

    def list_faq(self, limit: Optional[int] = None, cursor: Optional[str] = None) -> Dict[str, Any]:
        return self.request("/api/v1/faq", query={"limit": limit, "cursor": cursor})

    # ---- account (OAuth token) ----
    def get_account(self, fields: Optional[str] = None) -> Dict[str, Any]:
        return self.request("/api/v1/me", query={"fields": fields})

    def list_reports(self, limit: Optional[int] = None, cursor: Optional[str] = None) -> Dict[str, Any]:
        return self.request("/api/v1/reports", query={"limit": limit, "cursor": cursor})

    def all_reports(self, limit: int = 50) -> Iterator[Dict[str, Any]]:
        """Every report, newest first, following next_cursor for you."""
        cursor = None
        while True:
            page = self.list_reports(limit=limit, cursor=cursor)
            yield from page["reports"]
            cursor = page.get("next_cursor")
            if not cursor:
                return

    def create_report(self, website: str, country: Optional[str] = None, language: Optional[str] = None,
                      idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        body = {"website": website, **({"country": country} if country else {}), **({"language": language} if language else {})}
        return self.request("/api/v1/reports", "POST", body=body, idempotency_key=idempotency_key)

    def get_report(self, report_id: str, fields: Optional[str] = None) -> Dict[str, Any]:
        return self.request(f"/api/v1/reports/{urllib.parse.quote(report_id, safe='')}", query={"fields": fields})

    def batch_get_reports(self, report_ids: List[str]) -> Dict[str, Any]:
        return self.request("/api/v1/reports/batch", "POST", body={"report_ids": report_ids})

    def start_report(self, report_id: str, question_ids: Optional[List[str]] = None,
                     idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        body = {"question_ids": question_ids} if question_ids else {}
        return self.request(f"/api/v1/reports/{urllib.parse.quote(report_id, safe='')}/start", "POST", body=body,
                            idempotency_key=idempotency_key)

    def get_report_actions(self, report_id: str) -> Dict[str, Any]:
        return self.request(f"/api/v1/reports/{urllib.parse.quote(report_id, safe='')}/actions")

    def get_agent_readiness(self, report_id: str) -> Dict[str, Any]:
        return self.request(f"/api/v1/reports/{urllib.parse.quote(report_id, safe='')}/agent-readiness")

    def scan_agent_readiness(self, report_id: str, force: bool = False,
                             idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        return self.request(f"/api/v1/reports/{urllib.parse.quote(report_id, safe='')}/agent-readiness/scan", "POST",
                            body={"force": force}, idempotency_key=idempotency_key)

    def wait_for_report(self, report_id: str, until: Optional[List[str]] = None, timeout: float = 300.0) -> Dict[str, Any]:
        """Poll until the report reaches one of the stages in `until` (default: needs_confirmation, finished, failed)."""
        until = until or ["needs_confirmation", "finished", "analysis_failed", "failed"]
        deadline = time.time() + timeout
        while True:
            r = self.get_report(report_id)
            if r.get("stage") in until:
                return r
            if time.time() > deadline:
                raise TimeoutError(f"Timed out waiting for report {report_id} (stage {r.get('stage')}).")
            time.sleep(r.get("poll_after_seconds") or 5)

    # ---- sandbox: made-up data, no login ----
    def sandbox_create_report(self, website: str) -> Dict[str, Any]:
        return self.request("/api/v1/sandbox/reports", "POST", body={"website": website})

    def sandbox_get_report(self, report_id: str = "sandbox-report") -> Dict[str, Any]:
        return self.request(f"/api/v1/sandbox/reports/{urllib.parse.quote(report_id, safe='')}")

    def sandbox_get_account(self) -> Dict[str, Any]:
        return self.request("/api/v1/sandbox/me")


def _backoff(attempt: int) -> float:
    return min(8.0, 0.5 * 2 ** attempt) + random.random() * 0.25
