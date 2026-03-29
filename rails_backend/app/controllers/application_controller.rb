class ApplicationController < ActionController::Base
  def serve_file
    filename = params[:filename]
    file_path = Rails.root.join("public", "uploads", filename)

    if File.exist?(file_path)
      send_file file_path, type: Mime::Type.lookup_by_extension(File.extname(filename))
    else
      head :not_found
    end
  end
end
