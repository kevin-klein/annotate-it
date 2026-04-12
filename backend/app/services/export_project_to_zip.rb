class ExportProjectToZip
  def initialize(project)
    @project = project
  end

  def run
    images_data = collect_images_data
    zip_path = create_zip_file(images_data)

    {zip_path: zip_path, file_name: "#{project.name}_#{Time.current.strftime("%Y%m%d_%H%M%S")}.zip"}
  end

  private

  attr_reader :project

  def collect_images_data
    images = project.images.includes(:annotations)

    images.map do |image|
      {
        name: image.image.filename,
        data: image.image.download,
        annotations: image.annotations.map do |annotation|
          AnnotationExporter.new(annotation).to_xml
        end.compact
      }
    end
  end

  def create_zip_file(images_data)
    temp_dir = Rails.root.join("tmp")
    Dir.mkdir(temp_dir) unless Dir.exist?(temp_dir)

    zip_path = temp_dir.join("#{SecureRandom.hex}.zip")

    Zip::OutputStream.open(zip_path) do |zip_file|
      images_data.each do |image_data|
        add_image_to_zip(zip_file, image_data)
      end
    end

    zip_path
  end

  def add_image_to_zip(zip_file, image_data)
    zip_file.add(image_data[:name], image_data[:data])

    image_data[:annotations].each do |annotation_xml|
      annotation_name = image_data[:name].gsub(/\.#{File.extname(image_data[:name]).delete(".")}$/i, ".xml")
      zip_file.add(annotation_name, annotation_xml)
    end
  end
end
