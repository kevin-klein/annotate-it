class Label < ApplicationRecord
  belongs_to :project

  has_many :annotations, dependent: :destroy
end
