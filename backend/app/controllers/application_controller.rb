class ApplicationController < ActionController::API
  before_action :authenticate_user_from_token!

  private

  def authenticate_user_from_token!
    token = request.headers["Authorization"]&.split(" ")&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secrets.secret_key_base, true, {algorithm: "HS256"})
        @current_user = User.find(decoded.first["user_id"])
      rescue JWT::DecodeError
        render json: {error: "Invalid token"}, status: :unauthorized
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
