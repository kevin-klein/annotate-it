class RemoveAnnotationTypeFromAnnotations < ActiveRecord::Migration[8.1]
  def up
    remove_column :annotations, :annotation_type, :integer
  end

  def down
    add_column :annotations, :annotation_type, :integer
  end
end
