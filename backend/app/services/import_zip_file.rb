class ImportZipFile
  def initialize
    @temp_dir = Rails.root.join('tmp')
    @zip_extractor = ZipFileExtractor.new
    @parser = PascalVocParser.new
    @image_creator = ImageCreator.new
  end

  def run(project, file)
    temp_path = extract_temp_file(file.read)
    
    entries, warnings = @zip_extractor.extract(temp_path)
    
    import_entries(project, entries, warnings)

    { warnings: warnings }
  end

  private

  attr_reader :zip_extractor, :parser, :image_creator, :temp_dir

  def extract_temp_file(data)
    path = temp_dir.join("#{SecureRandom.hex}.zip")
    File.binwrite(path, data)
    path
  end

  def import_entries(project, entries, warnings)
    Image.transaction do
      entries.select(&:image?).each do |image_entry|
        annotation_entry = zip_extractor.annotation_for_image(entries, image_entry)
    
        image = image_creator.create(project, image_entry.data)
        save_annotations(project, image, annotation_entry)
      end
    end
  end

  def save_annotations(project, image, annotation_entry)
    return unless annotation_entry

    parser.parse(annotation_entry.data).each do |annotation|
      label = find_or_create_label(project, annotation.label)
      ann = image.annotations.create!(label: label)
      ann.data = annotation.points
    end
  end

  def find_or_create_label(project, label_name)
    project.labels.find_or_create_by(name: label_name)
  rescue ActiveRecord::RecordNotUnique
    project.labels.find_by(name: label_name)
  end
end
