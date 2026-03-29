module Api
  class ApplicationController < ActionController::API
    before_action :set_cors_headers

    def set_cors_headers
      response.headers["Access-Control-Allow-Origin"] = "*"
      response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
      response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    end
  end
end
