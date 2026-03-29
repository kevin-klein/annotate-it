module Api
  class ImagesController < ActionController::API
    def index
      project_id = params[:projectId]

      query = Image.all
      query = query.where(project_id: project_id) if project_id && project_id != "null"

      images = query.order(created_at: :desc)

      render json: images
    end

    def show
      image = Image.find(params[:id])
      annotations = image.annotations.order(created_at: :desc)
      render json: {**image.as_json, annotations: annotations}
    end

    def stats
      project_id = params[:projectId]
      query = Image.all.where(project_id: project_id) # if project_id && project_id != "null"

      total_images = query.count

      annotation_query = Annotation.joins(:image)
      if project_id && project_id != "null"
        annotation_query = annotation_query.joins(:image).where(images: {project_id: project_id})
      end

      render json: {
        total_images: total_images,
        total_annotations: annotation_query.count,
        object_detection_count: annotation_query.where(annotation_type: "object_detection").distinct.count,
        contrastive_count: annotation_query.where(annotation_type: "contrastive_learning").distinct.count,
        segmentation_count: annotation_query.where(annotation_type: "instance_segmentation").distinct.count
      }
    end

    def destroy
      image = Image.find(params[:id])
      image.destroy
      render json: {success: true}
    end

    private

    def image_params
      params.permit(:filename, :original_name, :file_path, :width, :height, :project_id, :metadata)
    end
  end
end
