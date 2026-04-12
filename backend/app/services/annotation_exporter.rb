class AnnotationExporter
  def initialize(annotation)
    @annotation = annotation
  end

  def to_xml
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.annotation(
        'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:noNamespaceSchemaLocation' => 'annotation.xsd'
      ) do
        xml.folder('project')
        xml.filename(File.basename(annotation.image.original_filename))
        xml.source do
          xml.database('AnnotationDB')
        end
        xml.size do
          xml.width(annotation.image.width)
          xml.height(annotation.image.height)
          xml.depth(annotation.image.depth || 3)
        end
        xml.segmented(0)
        
        annotation_points.each do |points|
          xml.object do
            xml.name(annotation.label.name)
            xml.bndbox do
              points.each_with_index do |point, index|
                x, y = point[0], point[1]
                xml.xmin(x.round)
                xml.ymin(y.round)
                xml.xmax(x.round)
                xml.ymax(y.round)
              end
            end
          end
        end
      end
    end

    builder.to_xml
  end

  private

  attr_reader :annotation

  def annotation_points
    case annotation.data
    when Array
      if annotation.data.first.is_a?(Array)
        # Multi-point annotation (polygon/segmentation)
        [annotation.data]
      else
        # Single point annotation
        [[annotation.data]]
      end
    else
      []
    end
  end
end
