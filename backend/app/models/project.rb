class Project < ApplicationRecord
  enum :annotation_type, {
    object_detection: 1,
  }

  has_many :labels
  has_many :images
end
