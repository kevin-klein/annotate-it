class LoginCodesController < ApplicationController
  skip_before_action :authenticate_user_from_token!, only: [:create]

  def create
    user = User.find_by(email: params[:email])
    if user
      code = user.generate_login_code
      LoginCodeMailer.login_code_email(user, code).deliver_later
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
