class ImageCreator
  def create(project, image_data)
    io = StringIO.new(image_data)
    image = Image.create!(project: project)
    extension = determine_extension(image_data)
    image.image.attach(io: io, filename: "#{image.id}.#{extension}")
    image
  end

  private

  def determine_extension(data)
    if data.start_with?("\x89PNG")
      'png'
    elsif data.start_with?("\xFF\xD8\xFF")
      'jpg'
    elsif data.start_with?("GIF")
      'gif'
    else
      'jpg'
    end
  end
end
