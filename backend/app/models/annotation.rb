class Annotation < ApplicationRecord
  belongs_to :image
  belongs_to :label

  has_one :object_detection_annotation, dependent: :destroy, autosave: false
  has_one :instance_segmentation_annotation, dependent: :destroy, autosave: false
  has_one :contrastive_learning_annotation, dependent: :destroy, autosave: false

  # Derive annotation type from the project (each project has a single type)
  def annotation_type
    image&.project&.annotation_type
  end

  def build_type_specific_record
    type = annotation_type
    return unless type
    case type
    when "object_detection"
      self.object_detection_annotation ||= ObjectDetectionAnnotation.new(annotation: self)
    when "instance_segmentation"
      self.instance_segmentation_annotation ||= InstanceSegmentationAnnotation.new(annotation: self)
    when "contrastive_learning"
      self.contrastive_learning_annotation ||= ContrastiveLearningAnnotation.new(annotation: self)
    end
  end

  def data
    case annotation_type
    when "object_detection"
      oda = object_detection_annotation
      return unless oda
      [
        [oda.xmin, oda.ymin],
        [oda.xmax, oda.ymin],
        [oda.xmax, oda.ymax],
        [oda.xmin, oda.ymax]
      ]
    when "instance_segmentation"
      instance_segmentation_annotation&.points
    when "contrastive_learning"
      contrastive_learning_annotation&.contrastive_points
    end
  end

  def data=(value)
    build_type_specific_record

    case annotation_type
    when "object_detection"
      if value.is_a?(Array) && value.size == 4
        record = object_detection_annotation
        record.update!(
          xmin: value.map { |p| p[0] }.min,
          ymin: value.map { |p| p[1] }.min,
          xmax: value.map { |p| p[0] }.max,
          ymax: value.map { |p| p[1] }.max
        )
      else
        raise
      end
    when "instance_segmentation"
      record = instance_segmentation_annotation || build_instance_segmentation_annotation
      record.update!(points: value) if value.is_a?(Array)
    when "contrastive_learning"
      record = contrastive_learning_annotation || build_contrastive_learning_annotation
      record.update!(contrastive_points: value) if value.is_a?(Array)
    else
      raise
    end
  end

  def annotation_points
    data
  end
end
