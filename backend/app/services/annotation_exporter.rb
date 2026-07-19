# backend/app/services/annotation_exporter.rb
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
        xml.filename(File.basename(annotation.image.image.attachment.blob.filename.to_s))
        xml.source do
          xml.database('AnnotationDB')
        end
        xml.size do
          xml.width(annotation.image.image.metadata[:width])
          xml.height(annotation.image.image.metadata[:height])
          xml.depth(annotation.image.image.metadata[:depth] || 3)
        end
        xml.segmented(0)
        
        annotation_points.each do |points|
          xml.object do
            xml.name(annotation.label&.name || "Unknown Label")
            xml.pose('Unspecified')
            xml.truncated(0)
            xml.difficult(0)
            xml.occluded(0)
            xml.bndbox do
              xs = points.map { _1[0] }
              ys = points.map { _1[1] }

              xml.xmin(xs.min)
              xml.xmax(xs.max)
              xml.ymin(ys.min)
              xml.ymax(ys.max)
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
    return [] unless annotation.data.is_a?(Array) && annotation.data.size == 4

    annotation.data.each do |point|
      return [] unless point.is_a?(Array) && point.size == 2
    end

    [annotation.data]
  rescue StandardError
    []
  end
end
