class Annotation < ApplicationRecord
  belongs_to :image
  validates :annotation_type, inclusion: { in: %w[object_detection contrastive_learning instance_segmentation] }
  validates :data, presence: true
  validates :image_id, presence: true
  
  def metadata_hash
    metadata.is_a?(Hash) ? metadata : JSON.parse(metadata || '{}')
  end
  
  def metadata_hash=(value)
    self.metadata = value.is_a?(Hash) ? value.to_json : value
  end
  
  def next_version
    self.version += 1
  end
end
