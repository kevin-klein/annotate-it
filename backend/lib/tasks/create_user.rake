namespace :users do
  desc "Create a new user"
  task create: :environment do
    email = ask("Email: ").strip

    user = User.new(email: email)

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
