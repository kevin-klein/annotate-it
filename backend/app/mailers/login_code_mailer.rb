class LoginCodeMailer < ApplicationMailer
  default from: "noreply@annotate.local"

  def login_code_email(user, code)
    @user = user
    @code = code
    @expires_in = 10.minutes
    mail(to: user.email, subject: "Your Login Code")
  end
end
