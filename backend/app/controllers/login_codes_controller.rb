class LoginCodesController < ApplicationController
  skip_before_action :authenticate_user_from_token!, only: [:create]

  RATE_LIMIT_SECONDS = 60

  def create
    ip = request.ip
    rate_limited = Rails.cache.write("login_code_rate:#{ip}", true, expire_in: RATE_LIMIT_SECONDS, raw: true)
    unless rate_limited
      render json: {error: "Too many requests. Please wait before requesting another code."}, status: :too_many_requests
      return
    end

    user = User.find_by(email: params[:email])
    if user
      begin
        code = user.generate_login_code
        LoginCodeMailer.login_code_email(user, code).deliver_later
      rescue => e
        Rails.logger.error("Failed to send login code email: #{e.message}")
      end
    end

    render json: {message: "Login code sent to your email"}, status: :ok
  end

  def verify
    user = User.find_by(email: params[:email])
    if user&.valid_login_code?(params[:code])
      user.clear_login_code
      render json: {token: user.generate_jwt}, status: :ok
    else
      render json: {error: "Invalid or expired code"}, status: :unauthorized
    end
  end
end
