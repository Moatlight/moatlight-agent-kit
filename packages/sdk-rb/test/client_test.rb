require "minitest/autorun"
require "webrick"
require "json"
require_relative "../lib/moatlight"

class ClientTest < Minitest::Test
  def test_get_and_error_and_retry
    calls = 0
    server = WEBrick::HTTPServer.new(Port: 0, Logger: WEBrick::Log.new(File::NULL), AccessLog: [])
    keys = []
    server.mount_proc("/api/v1/reports") do |req, res|
      calls += 1
      keys << req["Idempotency-Key"]
      if calls == 1
        res.status = 429
        res["Retry-After"] = "0"
        res.body = "{}"
      else
        res["RateLimit-Remaining"] = "7"
        res.body = JSON.generate({ id: "r1" })
      end
    end
    server.mount_proc("/api/v1/nope") do |_req, res|
      res.status = 404
      res.body = JSON.generate({ error: { code: "not_found", message: "no", hint: "h" } })
    end
    t = Thread.new { server.start }
    c = Moatlight::Client.new(base_url: "http://127.0.0.1:#{server.config[:Port]}")
    assert_equal "r1", c.create_report(website: "a.com")["id"]
    assert_equal 2, calls
    assert_equal 1, keys.uniq.size, "same key across retries"
    assert_equal 7, c.last_rate_limit[:remaining]
    err = assert_raises(Moatlight::Error) { c.request("/api/v1/nope") }
    assert_equal "not_found", err.code
    assert_equal 404, err.status
  ensure
    server&.shutdown
    t&.join
  end
end
