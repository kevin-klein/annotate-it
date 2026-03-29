class CreateImages < ActiveRecord::Migration[7.1]
  def change
    create_table :images do |t|
      t.string :filename, null: false
      t.string :original_name, null: false
      t.string :file_path, null: false
      t.integer :width, null: false
      t.integer :height, null: false
      t.references :project
      t.json :metadata, default: {}
      t.string :checksum
      t.string :export_path
      t.timestamps
    end

    add_index :images, :created_at
  end
end
