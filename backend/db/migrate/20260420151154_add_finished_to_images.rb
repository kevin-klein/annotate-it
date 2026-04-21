class AddFinishedToImages < ActiveRecord::Migration[8.1]
  def change
    add_column :images, :finished, :boolean, default: false, null: false
  end
end
