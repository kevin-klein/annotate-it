class ExportProjectToZip
  def initialize(project)
    @project = project
  end

  def run
    images_data = collect_images_data
    create_zip_file(images_data)
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
    Zip::OutputStream.write_buffer do |zip_file|
      images_data.each do |image_data|
        add_image_to_zip(zip_file, image_data)
      end
    end
  end

  def add_image_to_zip(zip_file, image_data)
    zip_file.put_next_entry(image_data[:name])
    zip_file.write(image_data[:data])

    image_data[:annotations].each do |annotation_xml|
      annotation_name = image_data[:name].gsub(/\.#{File.extname(image_data[:name]).delete(".")}$/i, ".xml")

      zip_file.put_next_entry(annotation_name)
      zip_file.write(annotation_xml)
    end
  end
end
