class Image < ApplicationRecord
  belongs_to :project

  has_one_attached :image
  has_many :annotations
end
