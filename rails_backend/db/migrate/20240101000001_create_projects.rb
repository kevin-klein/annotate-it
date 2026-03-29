class CreateProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :projects do |t|
      t.string :name, null: false
      t.text :description
      t.string :annotation_type, null: false, default: "object_detection"
      t.string :dataset_id
      t.timestamps
    end

    add_index :projects, :annotation_type
    add_index :projects, :created_at
  end
end
