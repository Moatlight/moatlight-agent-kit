package moatlight

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRetryKeepsKeyAndParsesErrors(t *testing.T) {
	calls := 0
	keys := map[string]bool{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/v1/nope" {
			w.WriteHeader(404)
			_, _ = w.Write([]byte(`{"error":{"code":"not_found","message":"no","hint":"h"}}`))
			return
		}
		calls++
		keys[r.Header.Get("Idempotency-Key")] = true
		if calls == 1 {
			w.Header().Set("Retry-After", "0")
			w.WriteHeader(429)
			return
		}
		w.Header().Set("RateLimit-Remaining", "7")
		_, _ = w.Write([]byte(`{"id":"r1"}`))
	}))
	defer srv.Close()
	c := New("")
	c.BaseURL = srv.URL
	out, err := c.CreateReport(context.Background(), "a.com", "", "", "")
	if err != nil || out["id"] != "r1" {
		t.Fatalf("got %v %v", out, err)
	}
	if calls != 2 || len(keys) != 1 {
		t.Fatalf("calls=%d keys=%d", calls, len(keys))
	}
	if c.LastRate.Remaining != 7 {
		t.Fatalf("rate %v", c.LastRate)
	}
	_, err = c.Do(context.Background(), "GET", "/api/v1/nope", nil, nil, "")
	if e, ok := err.(*Error); !ok || e.Code != "not_found" || e.Status != 404 {
		t.Fatalf("err %v", err)
	}
}
