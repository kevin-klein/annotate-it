class ImageCreator
  def create(image_data)
    io = StringIO.new(image_data)
    Image.create!(image: io)
  end
end
