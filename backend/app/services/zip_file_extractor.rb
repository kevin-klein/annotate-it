class ZipFileExtractor
  class Entry
    attr_reader :name, :data, :extension

    def initialize(name, data)
      @name = name
      @data = data
      @extension = File.extname(name).delete('.')
    end

    def image?
      ['png', 'jpg', 'gif'].include?(extension)
    end

    def annotation?
      extension == 'xml'
    end
  end

  def extract(path)
    entries = []
    warnings = []

    Zip::File.open(path) do |zip_file|
      zip_file.each do |entry|
        next if entry.ftype == :directory
        next if entry.name.include?('__MACOSX')

        if %w[png jpg gif xml].include?(entry.name.split('.')[-1])
          entries << Entry.new(entry.name, entry.get_input_stream.read)
        else
          warnings << "File #{entry.name} ignored"
        end
      end
    end

    [entries, warnings]
  end

  def annotation_for_image(entries, image_entry)
    annotation_name = image_entry.name.gsub(/\.#{image_entry.extension}$/i, '.xml')
    entries.select(&:annotation?).find { |a| a.name == annotation_name }
  end
end
