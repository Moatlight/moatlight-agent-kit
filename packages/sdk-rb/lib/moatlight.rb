# Moatlight API client. Standard library only.
#
# Writes carry an Idempotency-Key that stays the same across retries, and network errors, 429 and 5xx are
# retried (Retry-After honoured), so a retry can never start a second report.
require "json"
require "net/http"
require "securerandom"
require "uri"
require_relative "moatlight/version"

module Moatlight
  DEFAULT_BASE_URL = "https://moatlight.com".freeze

  # An API error: HTTP status plus the code, message and hint from the JSON error body.
  class Error < StandardError
    attr_reader :status, :code, :hint, :retry_after, :body

    def initialize(status, code, message, hint = nil, retry_after = nil, body = nil)
      super("#{code}: #{message}")
      @status, @code, @hint, @retry_after, @body = status, code, hint, retry_after, body
    end
  end

  class Client
    # RateLimit headers of the last answer: { limit:, remaining:, reset_seconds: }
    attr_reader :last_rate_limit

    def initialize(token: nil, base_url: DEFAULT_BASE_URL, max_retries: 3, timeout: 60)
      @token = token
      @base_url = base_url.sub(%r{/+\z}, "")
      @max_retries = max_retries
      @timeout = timeout
      @last_rate_limit = {}
    end

    # ---- public ----
    def get_product(fields: nil)
      request("/api/v1/product", query: { fields: fields })
    end
    def get_pricing(fields: nil)
      request("/api/v1/pricing", query: { fields: fields })
    end
    def get_sample_report
      request("/api/v1/sample-report")
    end
    def list_faq(limit: nil, cursor: nil)
      request("/api/v1/faq", query: { limit: limit, cursor: cursor })
    end

    # ---- account (OAuth token) ----
    def get_account(fields: nil)
      request("/api/v1/me", query: { fields: fields })
    end
    def list_reports(limit: nil, cursor: nil)
      request("/api/v1/reports", query: { limit: limit, cursor: cursor })
    end

    # Every report, newest first, following next_cursor for you.
    def each_report(limit: 50)
      return enum_for(:each_report, limit: limit) unless block_given?

      cursor = nil
      loop do
        page = list_reports(limit: limit, cursor: cursor)
        page["reports"].each { |r| yield r }
        cursor = page["next_cursor"]
        break unless cursor
      end
    end

    def create_report(website:, country: nil, language: nil, idempotency_key: nil)
      body = { website: website, country: country, language: language }.compact
      request("/api/v1/reports", method: :post, body: body, idempotency_key: idempotency_key)
    end

    def get_report(report_id, fields: nil)

      request("/api/v1/reports/#{esc(report_id)}", query: { fields: fields })

    end
    def batch_get_reports(report_ids)
      request("/api/v1/reports/batch", method: :post, body: { report_ids: report_ids })
    end

    def start_report(report_id, question_ids: nil, idempotency_key: nil)
      body = question_ids ? { question_ids: question_ids } : {}
      request("/api/v1/reports/#{esc(report_id)}/start", method: :post, body: body, idempotency_key: idempotency_key)
    end

    def get_report_actions(report_id)

      request("/api/v1/reports/#{esc(report_id)}/actions")

    end
    def get_agent_readiness(report_id)
      request("/api/v1/reports/#{esc(report_id)}/agent-readiness")
    end

    def scan_agent_readiness(report_id, force: false, idempotency_key: nil)
      request("/api/v1/reports/#{esc(report_id)}/agent-readiness/scan", method: :post, body: { force: force },
                                                                          idempotency_key: idempotency_key)
    end

    # ---- transport ----
    def request(path, method: :get, query: nil, body: nil, idempotency_key: nil)
      uri = URI(@base_url + path)
      params = (query || {}).compact
      uri.query = URI.encode_www_form(params) unless params.empty?
      key = method == :post ? (idempotency_key || SecureRandom.uuid) : nil
      attempt = 0
      begin
        res = perform(uri, method, body, key)
        record_rate_limit(res)
        code = res.code.to_i
        if code.between?(200, 299)
          return res.body.to_s.empty? ? nil : JSON.parse(res.body)
        end

        retry_after = res["Retry-After"].to_i
        retry_after = nil if retry_after.zero?
        if (code == 429 || code >= 500) && attempt < @max_retries
          attempt += 1
          sleep(retry_after ? [retry_after, 60].min : backoff(attempt - 1))
          raise Retry
        end
        payload = begin
          JSON.parse(res.body.to_s)
        rescue JSON::ParserError
          nil
        end
        err = payload.is_a?(Hash) ? (payload["error"] || {}) : {}
        raise Error.new(code, err["code"] || "http_#{code}", err["message"] || res.message, err["hint"], retry_after, payload)
      rescue Retry
        retry
      rescue SocketError, Timeout::Error, Errno::ECONNRESET, Errno::ECONNREFUSED, Net::OpenTimeout, Net::ReadTimeout
        raise if attempt >= @max_retries

        attempt += 1
        sleep(backoff(attempt - 1))
        retry
      end
    end

    private

    class Retry < StandardError; end

    def perform(uri, method, body, key)
      klass = method == :post ? Net::HTTP::Post : Net::HTTP::Get
      req = klass.new(uri)
      req["Accept"] = "application/json"
      req["User-Agent"] = "moatlight-ruby/#{VERSION}"
      req["Authorization"] = "Bearer #{@token}" if @token
      req["Idempotency-Key"] = key if key
      if body
        req["Content-Type"] = "application/json"
        req.body = JSON.generate(body)
      end
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: @timeout, read_timeout: @timeout) do |http|
        http.request(req)
      end
    end

    def record_rate_limit(res)
      num = ->(k) { (v = res[k]) && v =~ /\A\d+\z/ ? v.to_i : nil }
      @last_rate_limit = { limit: num.("RateLimit-Limit"), remaining: num.("RateLimit-Remaining"), reset_seconds: num.("RateLimit-Reset") }
    end

    def backoff(attempt)

      [0.5 * (2**attempt), 8].min + rand * 0.25

    end
    def esc(id)
      URI.encode_www_form_component(id.to_s).gsub("+", "%20")
    end
  end
end
