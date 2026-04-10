class AnnotationsController < ApplicationController
  before_action :set_annotation, only: %i[ show update destroy ]

  # GET /annotations
  def index
    @annotations = Annotation.all

    render json: @annotations
  end

  # GET /annotations/1
  def show
    render json: @annotation
  end

  # POST /annotations
  def create
    @annotation = Annotation.new(annotation_params)

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

    # Only allow a list of trusted parameters through.
    def annotation_params
      params.expect(annotation: [ :image_id, :data, :label_id ])
    end
end
