module Api
  class ProjectsController < ApplicationController
    def index
      projects = Project.all.includes(:images, :annotations)
      render json: {
        success: true,
        projects: projects.map { |p|
          {
            **p.as_json,
            **p.stats,
            dataset_name: p.dataset_id ? "Default" : nil
          }
        }
      }
    end

    def show
      project = Project.find(params[:id])
      render json: {
        success: true,
        project: {
          **project.as_json,
          **project.stats,
          dataset_name: project.dataset_id ? "Default" : nil
        }
      }
    end

    def create
      project = Project.new(project_params)
      if project.save
        render json: {
          success: true,
          project: {
            **project.as_json,
            **project.stats,
            dataset_name: project.dataset_id ? "Default" : nil
          }
        }, status: :created
      else
        render json: {error: project.errors.full_messages}, status: :unprocessable_entity
      end
    end

    def update
      project = Project.find(params[:id])
      if project.update(project_params)
        render json: {
          success: true,
          project: {
            **project.as_json,
            **project.stats,
            dataset_name: project.dataset_id ? "Default" : nil
          }
        }
      else
        render json: {error: project.errors.full_messages}, status: :unprocessable_entity
      end
    end

    def destroy
      project = Project.find(params[:id])
      project.destroy
      render json: {success: true}
    end

    def stats
      project = Project.find(params[:id])
      render json: project.stats
    end

    private

    def project_params
      params.permit(:name, :description, :annotation_type, :dataset_id)
    end
  end
end
