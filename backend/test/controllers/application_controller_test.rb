require "test_helper"

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  fixtures :users

  # Helper to generate a valid JWT
  def valid_token(user)
    JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.credentials.secret_key_base, "HS256")
  end

  # Helper to generate an expired JWT
  def expired_token(user)
    JWT.encode({ user_id: user.id, exp: 1.day.ago.to_i }, Rails.application.credentials.secret_key_base, "HS256")
  end

  test "should allow access with valid JWT token" do
    user = users(:one)
    token = valid_token(user)
    get "/api/projects", headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should reject request with expired JWT token" do
    user = users(:one)
    token = expired_token(user)
    post "/api/projects", headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :unauthorized
    assert_equal "Session expired", JSON.parse(@response.body)["error"]
    assert_equal true, JSON.parse(@response.body)["session_expired"]
  end

  test "should reject request with invalid JWT token" do
    post "/api/projects", headers: { "Authorization" => "Bearer invalid.token.here" }, as: :json
    assert_response :unauthorized
    assert_equal "Invalid token", JSON.parse(response.body)["error"]
    assert_equal false, JSON.parse(response.body)["session_expired"]
  end

  test "should reject request with no Authorization header" do
    get "/api/projects", as: :json
    assert_response :unauthorized
  end

  test "should reject request with empty Authorization header" do
    get "/api/projects", headers: { "Authorization" => "" }, as: :json
    assert_response :unauthorized
  end

  test "should reject request with malformed Bearer token (no space)" do
    get "/api/projects", headers: { "Authorization" => "notabearertoken" }, as: :json
    assert_response :unauthorized
  end

  test "should reject request with Bearer prefix but empty token" do
    get "/api/projects", headers: { "Authorization" => "Bearer " }, as: :json
    assert_response :unauthorized
  end
end
