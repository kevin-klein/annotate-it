module Api
  class AnnotationsController < ActionController::API
    def index
      image_id = params[:image_id]
      annotation_type = params[:annotation_type]

      query = Annotation.all
      query = query.where(image_id: image_id) if image_id
      query = query.where(annotation_type: annotation_type) if annotation_type

      annotations = query.order(created_at: :desc)
      render json: annotations
    end

    def show
      annotation = Annotation.find(params[:id])
      render json: annotation
    end

    def create
      annotation = Annotation.new(annotation_params)
      if annotation.save
        render json: annotation, status: :created
      else
        render json: {error: annotation.errors.full_messages}, status: :unprocessable_entity
      end
    end

    def update
      annotation = Annotation.find(params[:id])
      if annotation.update(annotation_params)
        render json: annotation
      else
        render json: {error: annotation.errors.full_messages}, status: :unprocessable_entity
      end
    end

    def destroy
      annotation = Annotation.find(params[:id])
      annotation.destroy
      render json: {success: true}
    end

    private

    def annotation_params
      params.permit(:id, :image_id, :annotation_type, :data, :label, :metadata, :confidence, :version, :quality_score, :review_status, :reviewer, :review_notes, :review_date)
    end
  end
end
