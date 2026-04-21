class EncryptEmails < ActiveRecord::Migration[8.1]
  def change
    rename_column :users, :email, :old_email
    add_column :users, :email, :text
    add_index :users, :email, unique: true

    User.find_each do |user|
      user.email = user.old_email
      user.save!
    end

    change_column :users, :email, :text, null: false
  end
end
