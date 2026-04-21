class ObjectDetectionAnnotation < ApplicationRecord
  belongs_to :annotation

  validates :xmin, :ymin, :xmax, :ymax, presence: true
  validate :coordinates_must_form_valid_box

  private

  def coordinates_must_form_valid_box
    return if xmin < xmax && ymin < ymax

    errors.add(:base, "Bounding box coordinates must form a valid box (xmin < xmax, ymin < ymax)")
  end
end
