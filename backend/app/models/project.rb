class Project < ApplicationRecord
  enum :annotation_type, {
    object_detection: 1,
    instance_segmentation: 2,
    contrastive_learning: 3
  }

  has_many :labels, dependent: :destroy
  has_many :images, dependent: :destroy
end
