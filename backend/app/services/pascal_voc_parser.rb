class PascalVocParser
  class Annotation
    attr_reader :label, :points

    def initialize(label, points)
      @label = label
      @points = points
    end

    def to_h
      { label: label, data: points }
    end
  end

  def parse(xml_data)
    return [] unless xml_data.present?

    doc = Nokogiri::XML(xml_data)
    objects = doc.xpath('//object')

    objects.map do |object_node|
      parse_object(object_node)
    end.compact
  end

  private

  def parse_object(object_node)
    label = extract_label(object_node)
    return nil unless label

    bbox = extract_bounding_box(object_node)
    return nil unless bbox

    Annotation.new(label, bounding_box_to_points(bbox))
  end

  def extract_label(object_node)
    object_node.at_xpath('name')&.text&.strip
  end

  def extract_bounding_box(object_node)
    bndbox = object_node.at_xpath('bndbox')
    return nil unless bndbox

    {
      xmin: extract_coordinate(bndbox, 'xmin'),
      ymin: extract_coordinate(bndbox, 'ymin'),
      xmax: extract_coordinate(bndbox, 'xmax'),
      ymax: extract_coordinate(bndbox, 'ymax')
    }
  end

  def extract_coordinate(bndbox, tag)
    bndbox.at_xpath(tag)&.text&.to_f
  end

  def bounding_box_to_points(bbox)
    return nil if [bbox[:xmin], bbox[:ymin], bbox[:xmax], bbox[:ymax]].any?(&:nil?)

    [
      [bbox[:xmin], bbox[:ymin]],
      [bbox[:xmax], bbox[:ymin]],
      [bbox[:xmax], bbox[:ymax]],
      [bbox[:xmin], bbox[:ymax]]
    ]
  end
end
