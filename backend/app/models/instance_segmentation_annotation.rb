class InstanceSegmentationAnnotation < ApplicationRecord
  belongs_to :annotation

  validates :points, presence: true
  validate :points_must_contain_at_least_three

  private

  def points_must_contain_at_least_three
    return if points.is_a?(Array) && points.size >= 3

    errors.add(:points, "must contain at least 3 points for a valid polygon")
  end
end
