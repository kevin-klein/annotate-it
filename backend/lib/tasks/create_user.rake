namespace :users do
  desc "Create a new user"
  task create_user: :environment do
    email = ask("Email: ").strip
    password = ask("Password: ") { |q| q.echo = false }
    password_confirmation = ask("Password confirmation: ") { |q| q.echo = false }

    user = User.new(email: email, password: password, password_confirmation: password_confirmation)

    if user.save
      puts "User created successfully: #{email}"
    else
      puts "Failed to create user:"
      user.errors.full_messages.each { |msg| puts "  - #{msg}" }
    end
  end

  private

  def ask(prompt)
    print prompt
    $stdin.gets&.chomp
  end
end
