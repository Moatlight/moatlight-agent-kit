// Package moatlight is the official Go client for the Moatlight API (https://www.moatlight.com/docs).
//
// Standard library only. Writes carry an Idempotency-Key that stays the same across retries, and network
// errors, 429 and 5xx are retried (Retry-After honoured), so a retry can never start a second report.
package moatlight

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const (
	Version        = "1.1.0"
	DefaultBaseURL = "https://www.moatlight.com"
)

// Error is an API error: HTTP status plus the code, message and hint from the JSON error body.
type Error struct {
	Status     int
	Code       string
	Message    string
	Hint       string
	RetryAfter int
}

func (e *Error) Error() string { return fmt.Sprintf("%s: %s", e.Code, e.Message) }

// RateLimit holds the RateLimit headers of the last answer (-1 when absent).
type RateLimit struct{ Limit, Remaining, ResetSeconds int }

// Client talks to the API. Token is an OAuth access token; public endpoints need none.
type Client struct {
	Token      string
	BaseURL    string
	MaxRetries int
	HTTP       *http.Client
	LastRate   RateLimit
}

// New returns a client with defaults. Pass "" for a token to use the public endpoints.
func New(token string) *Client {
	return &Client{Token: token, BaseURL: DefaultBaseURL, MaxRetries: 3, HTTP: &http.Client{Timeout: 60 * time.Second}, LastRate: RateLimit{-1, -1, -1}}
}

// Map is a decoded JSON object.
type Map = map[string]interface{}

// Query is a set of optional query parameters; empty values are left out.
type Query map[string]string

// Do sends a request and decodes the JSON answer. method is GET or POST; key is the Idempotency-Key for POST
// ("" makes a new one that is reused across retries).
func (c *Client) Do(ctx context.Context, method, path string, q Query, body interface{}, key string) (Map, error) {
	u := c.BaseURL + path
	params := url.Values{}
	for k, v := range q {
		if v != "" {
			params.Set(k, v)
		}
	}
	if len(params) > 0 {
		u += "?" + params.Encode()
	}
	var payload []byte
	if body != nil {
		var err error
		if payload, err = json.Marshal(body); err != nil {
			return nil, err
		}
	}
	if method == http.MethodPost && key == "" {
		b := make([]byte, 16)
		_, _ = rand.Read(b)
		key = hex.EncodeToString(b)
	}
	for attempt := 0; ; attempt++ {
		req, err := http.NewRequestWithContext(ctx, method, u, bytes.NewReader(payload))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Accept", "application/json")
		req.Header.Set("User-Agent", "moatlight-go/"+Version)
		if c.Token != "" {
			req.Header.Set("Authorization", "Bearer "+c.Token)
		}
		if body != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		if method == http.MethodPost {
			req.Header.Set("Idempotency-Key", key)
		}
		res, err := c.HTTP.Do(req)
		if err != nil {
			if attempt >= c.MaxRetries || ctx.Err() != nil {
				return nil, err
			}
			sleep(ctx, backoff(attempt))
			continue
		}
		data, _ := io.ReadAll(res.Body)
		res.Body.Close()
		c.LastRate = RateLimit{header(res, "RateLimit-Limit"), header(res, "RateLimit-Remaining"), header(res, "RateLimit-Reset")}
		if res.StatusCode >= 200 && res.StatusCode < 300 {
			var out Map
			if len(data) == 0 {
				return nil, nil
			}
			return out, json.Unmarshal(data, &out)
		}
		retryAfter, _ := strconv.Atoi(res.Header.Get("Retry-After"))
		if (res.StatusCode == 429 || res.StatusCode >= 500) && attempt < c.MaxRetries {
			wait := backoff(attempt)
			if retryAfter > 0 {
				wait = time.Duration(min(retryAfter, 60)) * time.Second
			}
			sleep(ctx, wait)
			continue
		}
		var parsed struct {
			Error struct{ Code, Message, Hint string } `json:"error"`
		}
		_ = json.Unmarshal(data, &parsed)
		e := &Error{Status: res.StatusCode, Code: parsed.Error.Code, Message: parsed.Error.Message, Hint: parsed.Error.Hint, RetryAfter: retryAfter}
		if e.Code == "" {
			e.Code = "http_" + strconv.Itoa(res.StatusCode)
		}
		if e.Message == "" {
			e.Message = http.StatusText(res.StatusCode)
		}
		return nil, e
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func header(res *http.Response, name string) int {
	if n, err := strconv.Atoi(res.Header.Get(name)); err == nil {
		return n
	}
	return -1
}

func backoff(attempt int) time.Duration {
	d := 500 * time.Millisecond << uint(attempt)
	if d > 8*time.Second {
		d = 8 * time.Second
	}
	return d
}

func sleep(ctx context.Context, d time.Duration) {
	select {
	case <-time.After(d):
	case <-ctx.Done():
	}
}

func esc(id string) string { return url.PathEscape(id) }

// ---- public ----

func (c *Client) GetProduct(ctx context.Context, fields string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/product", Query{"fields": fields}, nil, "")
}
func (c *Client) GetPricing(ctx context.Context, fields string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/pricing", Query{"fields": fields}, nil, "")
}
func (c *Client) GetSampleReport(ctx context.Context) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/sample-report", nil, nil, "")
}
func (c *Client) ListFAQ(ctx context.Context, limit, cursor string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/faq", Query{"limit": limit, "cursor": cursor}, nil, "")
}

// ---- account (OAuth token) ----

func (c *Client) GetAccount(ctx context.Context, fields string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/me", Query{"fields": fields}, nil, "")
}
func (c *Client) ListReports(ctx context.Context, limit, cursor string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/reports", Query{"limit": limit, "cursor": cursor}, nil, "")
}

// CreateReport creates a draft report for a website. country and language are optional.
func (c *Client) CreateReport(ctx context.Context, website, country, language, idempotencyKey string) (Map, error) {
	body := Map{"website": website}
	if country != "" {
		body["country"] = country
	}
	if language != "" {
		body["language"] = language
	}
	return c.Do(ctx, "POST", "/api/v1/reports", nil, body, idempotencyKey)
}
func (c *Client) GetReport(ctx context.Context, id, fields string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/reports/"+esc(id), Query{"fields": fields}, nil, "")
}
func (c *Client) BatchGetReports(ctx context.Context, ids []string) (Map, error) {
	return c.Do(ctx, "POST", "/api/v1/reports/batch", nil, Map{"report_ids": ids}, "")
}
func (c *Client) StartReport(ctx context.Context, id string, questionIDs []string, idempotencyKey string) (Map, error) {
	body := Map{}
	if len(questionIDs) > 0 {
		body["question_ids"] = questionIDs
	}
	return c.Do(ctx, "POST", "/api/v1/reports/"+esc(id)+"/start", nil, body, idempotencyKey)
}
func (c *Client) GetReportActions(ctx context.Context, id string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/reports/"+esc(id)+"/actions", nil, nil, "")
}
func (c *Client) GetAgentReadiness(ctx context.Context, id string) (Map, error) {
	return c.Do(ctx, "GET", "/api/v1/reports/"+esc(id)+"/agent-readiness", nil, nil, "")
}
func (c *Client) ScanAgentReadiness(ctx context.Context, id string, force bool, idempotencyKey string) (Map, error) {
	return c.Do(ctx, "POST", "/api/v1/reports/"+esc(id)+"/agent-readiness/scan", nil, Map{"force": force}, idempotencyKey)
}
