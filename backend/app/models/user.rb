class User < ApplicationRecord
  has_secure_password
  has_many :projects

  validates :email, presence: true, uniqueness: true, format: {with: URI::MailTo::EMAIL_REGEXP}
  validates :password_digest, presence: true

  def generate_jwt
    JWT.encode({user_id: id, exp: 1.day.from_now.to_i}, Rails.application.credentials.secret_key_base, "HS256")
  end

  def generate_login_code
    code = SecureRandom.hex
    update_columns(
      login_code: code,
      login_code_expiry: 10.minutes.from_now
    )
    code
  end

  def valid_login_code?(code)
    return false unless login_code && login_code_expiry
    return false unless login_code == code
    return false if login_code_expiry < Time.now
    true
  end

  def clear_login_code
    update_columns(login_code: nil, login_code_expiry: nil)
  end
end
