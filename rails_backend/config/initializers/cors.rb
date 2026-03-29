# Rails.application.config.middleware.insert_before 0, Rack::Cors do
#   allow do
#     origins "*"
#     resource "/api/*", headers: :any, methods: [:get, :post, :put, :patch, :delete, :options], credentials: false
#     resource "/uploads/*", headers: :any, methods: [:get, :options]
#   end
# end
