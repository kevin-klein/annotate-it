class ImagesController < ApplicationController
  before_action :set_image, only: %i[show update destroy]

  # GET /images
  def index
    @images = Image.where(project_id: params[:project_id])

    data = @images.map do |image|
      {
        id: image.id,
        width: image.image.metadata[:width],
        height: image.image.metadata[:height],
        created_at: image.created_at,
        updated_at: image.updated_at,
        file_path: rails_blob_url(image.image)
      }
    end

    render json: data
  end

  # GET /images/1
  def show
    render json: @image
  end

  # POST /images
  def create
    if image_is_zip?
      project = Project.find(params[:image][:project_id])
      ImportZipFile.new.run(project, params[:image][:image])

      render json: {
        success: true
      }
    else
      @image = Image.new(image_params)

      if @image.save
        render json: @image, status: :created, location: @image
      else
        render json: @image.errors, status: :unprocessable_content
      end
    end
  end

  # PATCH/PUT /images/1
  def update
    if @image.update(image_params)
      render json: @image
    else
      render json: @image.errors, status: :unprocessable_content
    end
  end

  # DELETE /images/1
  def destroy
    @image.destroy!

    head :no_content
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_image
    @image = Image.find(params.expect(:id))
  end

  # Only allow a list of trusted parameters through.
  def image_params
    params.expect(image: [ :project_id, :image ])
  end

  def image_is_zip?
    file = params[:image]&.[](:image)
    file&.content_type == "application/x-zip-compressed"
  end
end
