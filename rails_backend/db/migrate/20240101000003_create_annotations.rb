class CreateAnnotations < ActiveRecord::Migration[7.1]
  def change
    create_table :annotations do |t|
      t.references :image, null: false, foreign_key: true
      t.string :annotation_type, null: false
      t.json :data, null: false
      t.string :label
      t.json :metadata, default: {}
      t.float :confidence
      t.integer :version, default: 1
      t.float :quality_score
      t.string :review_status, default: "pending"
      t.string :reviewer
      t.text :review_notes
      t.datetime :review_date
      t.timestamps
    end

    add_index :annotations, :annotation_type
    add_index :annotations, :version
  end
end
