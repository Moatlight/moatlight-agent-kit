# moatlight (Ruby)

Official Ruby client for the [Moatlight API](https://moatlight.com/docs). Standard library only.

```ruby
require "moatlight"

client = Moatlight::Client.new                       # public endpoints need no token
puts client.get_product["name"]

client = Moatlight::Client.new(token: ENV["MOATLIGHT_TOKEN"])  # OAuth access token
report = client.create_report(website: "yourcompany.com")
client.start_report(report["id"])
```

Try it with no login against the sandbox: `Moatlight::Client.new(base_url: "https://moatlight.com/api/v1/sandbox")` is not needed, the sandbox shares the paths under `/api/v1/sandbox`; see https://moatlight.com/docs#sandbox.

Writes send an `Idempotency-Key`, so a retry never starts a second report. `429` and `5xx` are retried and `Retry-After` is honoured. Errors raise `Moatlight::Error` with `status`, `code`, `message`, `hint`.

Homepage: https://moatlight.com. Source: https://github.com/Moatlight/moatlight-agent-kit. License: MIT.
