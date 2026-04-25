class ImageCreator
  def create(project, image_data, name)
    io = StringIO.new(image_data)
    image = Image.create!(project: project)
    image.image.attach(io: io, filename: name)
    image
  end
end
