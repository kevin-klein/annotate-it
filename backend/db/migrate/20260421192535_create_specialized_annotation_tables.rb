class CreateSpecializedAnnotationTables < ActiveRecord::Migration[8.1]
  def up
    # Create object_detection_annotations table
    create_table :object_detection_annotations do |t|
      t.references :annotation, null: false, foreign_key: true
      t.decimal :xmin, null: false
      t.decimal :ymin, null: false
      t.decimal :xmax, null: false
      t.decimal :ymax, null: false
      t.timestamps
    end

    # Create instance_segmentation_annotations table
    create_table :instance_segmentation_annotations do |t|
      t.references :annotation, null: false, foreign_key: true
      t.json :points, null: false
      t.timestamps
    end

    # Create contrastive_learning_annotations table
    create_table :contrastive_learning_annotations do |t|
      t.references :annotation, null: false, foreign_key: true
      t.json :contrastive_points, null: false
      t.timestamps
    end

    # Add annotation_type column to annotations table
    add_column :annotations, :annotation_type, :string

    # Migrate existing data from annotations.data to specialized tables
    Annotation.find_each do |annotation|
      next unless annotation.data.is_a?(Array)
      next unless annotation.image&.project

      project_type = annotation.image.project.annotation_type

      case project_type
      when "object_detection"
        next unless annotation.data.size == 4

        xs = annotation.data.map { |p| p[0] }
        ys = annotation.data.map { |p| p[1] }

        ObjectDetectionAnnotation.create!(
          annotation: annotation,
          xmin: xs.min,
          ymin: ys.min,
          xmax: xs.max,
          ymax: ys.max
        )

      when "instance_segmentation"
        next unless annotation.data.size >= 3

        InstanceSegmentationAnnotation.create!(
          annotation: annotation,
          points: annotation.data
        )

      when "contrastive_learning"
        ContrastiveLearningAnnotation.create!(
          annotation: annotation,
          contrastive_points: annotation.data
        )
      end
    end

    # Update all annotations with their type
    Annotation.find_each do |annotation|
      next unless annotation.image&.project

      annotation_type = annotation.image.project.annotation_type
      annotation.update_column(:annotation_type, annotation_type)
    end

    # Remove the old data column
    remove_column :annotations, :data
  end

  def down
    # Re-add the data column
    add_column :annotations, :data, :json

    # Migrate data back
    ObjectDetectionAnnotation.find_each do |oda|
      oda.annotation.update_column(:data, [
        [oda.xmin, oda.ymin],
        [oda.xmax, oda.ymin],
        [oda.xmax, oda.ymax],
        [oda.xmin, oda.ymax]
      ])
    end

    InstanceSegmentationAnnotation.find_each do |isa|
      isa.annotation.update_column(:data, isa.points)
    end

    ContrastiveLearningAnnotation.find_each do |cla|
      cla.annotation.update_column(:data, cla.contrastive_points)
    end

    # Drop specialized tables
    drop_table :contrastive_learning_annotations
    drop_table :instance_segmentation_annotations
    drop_table :object_detection_annotations

    # Remove annotation_type column
    remove_column :annotations, :annotation_type
  end
end
