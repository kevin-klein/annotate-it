class ImageCreator
  def create(project, image_data)
    io = StringIO.new(image_data)
    image = Image.create!(project: project)
    image.image.attach(io: io, filename: "#{image.id}.jpg")
    image
  end
end
