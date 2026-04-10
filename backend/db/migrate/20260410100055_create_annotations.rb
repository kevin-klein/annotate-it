class CreateAnnotations < ActiveRecord::Migration[8.1]
  def change
    create_table :annotations do |t|
      t.references :image, null: false, foreign_key: true
      t.json :data, null: false
      t.references :label, null: false, foreign_key: true

      t.timestamps
    end
  end
end
