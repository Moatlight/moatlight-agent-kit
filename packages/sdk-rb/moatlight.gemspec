require_relative "lib/moatlight/version"

Gem::Specification.new do |s|
  s.name = "moatlight"
  s.version = Moatlight::VERSION
  s.summary = "Official Ruby client for the Moatlight API"
  s.description = "Measure whether ChatGPT and Google AI Overview name a business. Standard library only; writes carry an Idempotency-Key and 429/5xx are retried."
  s.authors = ["Moatlight"]
  s.email = "ceo@moatlight.com"
  s.license = "MIT"
  s.homepage = "https://moatlight.com"
  s.required_ruby_version = ">= 2.7"
  s.files = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  s.require_paths = ["lib"]
  s.metadata = {
    "homepage_uri" => "https://moatlight.com",
    "source_code_uri" => "https://github.com/Moatlight/moatlight-agent-kit",
    "documentation_uri" => "https://moatlight.com/docs",
    "bug_tracker_uri" => "https://github.com/Moatlight/moatlight-agent-kit/issues",
    "rubygems_mfa_required" => "true"
  }
end
