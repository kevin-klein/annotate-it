class ContrastiveLearningAnnotation < ApplicationRecord
  belongs_to :annotation

  validates :contrastive_points, presence: true
  validate :points_must_contain_at_least_two

  private

  def points_must_contain_at_least_two
    return if contrastive_points.is_a?(Array) && contrastive_points.size >= 2

    errors.add(:contrastive_points, "must contain at least 2 points for contrastive learning")
  end
end
