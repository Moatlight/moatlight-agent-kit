# moatlight (Python)

Official Python client for the [Moatlight API](https://www.moatlight.com/docs): measure whether ChatGPT and Google AI Overview name a business. Standard library only; Python 3.9+.

```bash
pip install moatlight
```

```python
from moatlight import Moatlight

api = Moatlight()                              # no login: public endpoints and the sandbox
print(api.sandbox_get_report()["stage"])       # "finished" (made-up data)

api = Moatlight(token="...")                   # OAuth access token, see https://www.moatlight.com/auth.md
report = api.create_report("yourcompany.com")  # 202 Accepted, safe to retry (Idempotency-Key)
report = api.wait_for_report(report["id"])
for r in api.all_reports():                    # follows next_cursor
    print(r["id"], r["stage"])
```

Network errors, 429 and 5xx are retried (`Retry-After` honoured); errors raise `MoatlightError` with `status`, `code`, `message`, `hint`. Docs: https://www.moatlight.com/docs · Source: https://github.com/Moatlight/moatlight-agent-kit · MIT
