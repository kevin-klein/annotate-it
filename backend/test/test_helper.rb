ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "jwt"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...

    # Generate a valid JWT token for the given user
    def valid_token(user)
      JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.credentials.secret_key_base, "HS256")
    end
  end
end
