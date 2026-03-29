module Api
  class UploadsController < ActionController::API
    def create
      result = ImageUploadService.new(params[:image], params[:projectId]).execute

      if result[:success]
        render json: result, status: :created
      else
        render json: result, status: :bad_request
      end
    end
  end
end
