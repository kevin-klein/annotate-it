class ExportProjectToZip
  def initialize(project)
    @project = project
  end

  def run
    create_zip_file
  end

  private

  attr_reader :project

  def create_zip_file
    Zip::OutputStream.write_buffer do |zip_file|
      project.images.includes(:annotations).each do |image|
        add_image_to_zip(zip_file, image)
      end
    end
  end

  def add_image_to_zip(zip_file, image)
    zip_file.put_next_entry(image.image.filename.to_s)
    image.image.download do |chunk|
      zip_file.write(chunk)
    end

    image.annotations.each do |annotation|
      xml = AnnotationExporter.new(annotation).to_xml
      next unless xml

      annotation_name = generate_annotation_name(image.image.filename.to_s)
      zip_file.put_next_entry(annotation_name)
      zip_file.write(xml)
    end
  end

  def generate_annotation_name(image_filename)
    extension = File.extname(image_filename).delete(".")
    image_filename.gsub(/\.#{extension}$/i, ".xml")
  end
end
