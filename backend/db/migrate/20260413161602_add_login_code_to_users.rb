class AddLoginCodeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :login_code, :string
    add_column :users, :login_code_expiry, :datetime
  end
end
