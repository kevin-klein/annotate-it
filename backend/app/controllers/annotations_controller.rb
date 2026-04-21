class AnnotationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_annotation, only: %i[show update destroy]

  # GET /annotations
  def index
    @annotations = Annotation.where(image_id: params[:image_id])

    render json: @annotations.as_json(methods: [:data])
  end

  # GET /annotations/1
  def show
    render json: @annotation
  end

  # POST /annotations
  def create
    if annotation_params[:id].is_a?(Integer)
      @annotation = Annotation.find(annotation_params[:id])
      @annotation.update(annotation_params.except(:data))
      @annotation.data = params[:annotation][:data] 
    else
      @annotation = Annotation.new(annotation_params.except(:id))
    end

    if @annotation.save
      render json: @annotation, status: :created, location: @annotation
    else
      render json: @annotation.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /annotations/1
  def update
    @annotation.update(annotation_params.except(:data))
    @annotation.data = params[:annotation][:data]

    render json: @annotation
  rescue ActiveRecord::RecordInvalid => e
    render json: e.record.errors, status: :unprocessable_entity
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
