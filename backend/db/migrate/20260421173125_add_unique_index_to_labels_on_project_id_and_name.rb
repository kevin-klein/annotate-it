class AddUniqueIndexToLabelsOnProjectIdAndName < ActiveRecord::Migration[8.1]
  def change
    add_index :labels, [:project_id, :name], unique: true
  end
end
