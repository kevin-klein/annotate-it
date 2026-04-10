class Project < ApplicationRecord
  enum :annotation_type, {
    object_detection: 1,
  }
end
