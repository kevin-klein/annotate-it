class CreateLabels < ActiveRecord::Migration[8.1]
  def change
    create_table :labels do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name, null: false
      t.string :color

      t.timestamps
    end
  end
end
