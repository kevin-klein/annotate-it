class Label < ApplicationRecord
  belongs_to :project

  validates :name, presence: true, uniqueness: { scope: :project_id }

  has_many :annotations, dependent: :destroy
end
