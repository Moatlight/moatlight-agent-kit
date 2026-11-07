# moatlight (Go)

Official Go client for the [Moatlight API](https://moatlight.com/docs). Standard library only.

```go
import "github.com/Moatlight/moatlight-agent-kit/packages/sdk-go"

c := moatlight.New("")                       // public endpoints need no token
product, _ := c.GetProduct(ctx, "")

c = moatlight.New(os.Getenv("MOATLIGHT_TOKEN")) // OAuth access token
report, _ := c.CreateReport(ctx, "yourcompany.com", "", "", "")
```

Writes send an `Idempotency-Key`, so a retry never starts a second report. `429` and `5xx` are retried and `Retry-After` is honoured. Errors are `*moatlight.Error` with `Status`, `Code`, `Message`, `Hint`. No-login sandbox: https://moatlight.com/docs#sandbox.

Homepage: https://moatlight.com. Source: https://github.com/Moatlight/moatlight-agent-kit. License: MIT.
