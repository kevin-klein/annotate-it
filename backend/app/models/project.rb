class Project < ApplicationRecord
  belongs_to :user
  enum :annotation_type, {
    object_detection: 1,
    instance_segmentation: 2,
    contrastive_learning: 3
  }

  has_many :labels
  has_many :images
end
