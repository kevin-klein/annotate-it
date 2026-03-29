class Image < ApplicationRecord
  belongs_to :project, optional: true
  has_many :annotations, dependent: :destroy

  validates :filename, presence: true
  validates :original_name, presence: true
  validates :file_path, presence: true
  validates :width, presence: true
  validates :height, presence: true

  def metadata_hash
    metadata.is_a?(Hash) ? metadata : JSON.parse(metadata || "{}")
  end

  def metadata_hash=(value)
    self.metadata = value.is_a?(Hash) ? value.to_json : value
  end
end
