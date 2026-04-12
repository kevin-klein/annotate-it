class AnnotationsController < ApplicationController
  before_action :set_annotation, only: %i[show update destroy]

  # GET /annotations
  def index
    @annotations = Annotation.where(image_id: params[:image_id])

    render json: @annotations
  end

  # GET /annotations/1
  def show
    render json: @annotation
  end

  # POST /annotations
  def create
    ap annotation_params
    if annotation_params[:id].is_a?(Integer)
      @annotation = Annotation.find(annotation_params[:id])
      @annotation.update(annotation_params)
    else
      @annotation = Annotation.new(annotation_params)
    end

    if @annotation.save
      render json: @annotation, status: :created, location: @annotation
    else
      render json: @annotation.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /annotations/1
  def update
    if @annotation.update(annotation_params)
      render json: @annotation
    else
      render json: @annotation.errors, status: :unprocessable_content
    end
  end

  # DELETE /annotations/1
  def destroy
    @annotation.destroy!
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_annotation
    @annotation = Annotation.find(params.expect(:id))
  end

  def annotation_params
    params.require(:annotation).permit(:id, :image_id, :label_id, data: [[]]).tap do |whitelisted|
      whitelisted[:data] = params[:annotation][:data] if params[:annotation][:data]
    end
  end
end
