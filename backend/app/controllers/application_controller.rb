class ApplicationController < ActionController::API
  before_action :authenticate_user_from_token!

  private

  def authenticate_user_from_token!
    token = request.headers["Authorization"]&.split(" ")&.last

    if token
      begin
        decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, {algorithm: "HS256"})
        @current_user = User.find(decoded.first["user_id"])
      rescue JWT::ExpiredSignature
        render json: { error: "Session expired", session_expired: true }, status: :unauthorized
      rescue JWT::DecodeError => e
        render json: { error: "Invalid token", session_expired: false }, status: :unauthorized
      end
    end
  end

  attr_reader :current_user

  def authenticate_user!
    unless current_user
      render json: {error: "Unauthorized"}, status: :unauthorized
    end
  end
end
