class ProjectsController < ApplicationController
  before_action :set_project, only: %i[show update destroy export]
  before_action :authenticate_user!

  # GET /projects
  def index
    @projects = Project.all

    render json: @projects
  end

  # GET /projects/1
  def show
    render json: @project
  end

  # POST /projects
  def create
    @project = Project.new(project_params)

    if @project.save
      render json: @project, status: :created, location: @project
    else
      render json: @project.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /projects/1
  def update
    if @project.update(project_params)
      render json: @project
    else
      render json: @project.errors, status: :unprocessable_content
    end
  end

  # DELETE /projects/1
  def destroy
    @project.destroy!

    render json: {}
  end

  # GET /projects/:id/export
  def export
    export_service = ExportProjectToZip.new(@project)
    result = export_service.run

    send_data(
      result.read,
      filename: "export.zip",
      type: "application/zip",
      disposition: "attachment",
      status: :ok
    )
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_project
    @project = Project.find(params.expect(:id))
  end

  # Only allow a list of trusted parameters through.
  def project_params
    params.expect(project: [:name, :description, :annotation_type])
  end
end
