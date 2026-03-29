class ImageUploadService
  def initialize(file, project_id = nil)
    @file = file
    @project_id = (project_id && project_id != "null") ? project_id : nil
  end

  def execute
    return {success: false, error: "No image file provided"} unless @file

    # Generate unique filename
    filename = "#{SecureRandom.uuid}#{File.extname(@file.original_filename)}"

    # Ensure upload directory exists
    upload_dir = Rails.root.join("public", "uploads")
    FileUtils.mkdir_p(upload_dir) unless Dir.exist?(upload_dir)

    # Save file
    file_path = upload_dir.join(filename)
    File.binwrite(file_path, @file.read)

    # Get image dimensions
    begin
      image = MiniMagick::Image.open(file_path)
      width = image.width
      height = image.height
    rescue => e
      Rails.logger.error("Error getting image dimensions: #{e.message}")
      width = 0
      height = 0
    end

    # Create image record
    image = Image.create!(
      filename: filename,
      original_name: @file.original_filename,
      file_path: "/uploads/#{filename}",
      width: width,
      height: height,
      project_id: @project_id,
      metadata: {}
    )

    {
      success: true,
      image: {
        id: image.id,
        filename: image.filename,
        path: image.file_path,
        width: image.width,
        height: image.height
      }
    }
  end
end
