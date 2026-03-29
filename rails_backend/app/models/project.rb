class Project < ApplicationRecord
  validates :name, presence: true
  validates :annotation_type, inclusion: { in: %w[object_detection contrastive_learning instance_segmentation] }
  
  has_many :images, dependent: :destroy
  has_many :annotations, through: :images, dependent: :destroy
  
  def stats
    {
      total_images: images.count,
      annotated_images: images.joins(:annotations).distinct.count,
      total_annotations: annotations.count,
      progress_percentage: images.count.zero? ? 0 : ((images.joins(:annotations).distinct.count.to_f / images.count) * 100).round(2)
    }
  end
end
