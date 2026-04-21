class SessionsController < ApplicationController
  skip_before_action :authenticate_user_from_token!, only: [:create, :destroy]

  def create
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      render json: {token: user.generate_jwt}, status: :ok
    else
      render json: {error: "Invalid credentials"}, status: :unauthorized
    end
  end

  def destroy
    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end
end
