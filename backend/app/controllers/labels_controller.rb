class LabelsController < ApplicationController
  before_action :set_label, only: %i[ show update destroy ]

  # GET /labels
  def index
    @labels = Label.all

    render json: @labels
  end

  # GET /labels/1
  def show
    render json: @label
  end

  # POST /labels
  def create
    @label = Label.new(label_params)

    if @label.save
      render json: @label, status: :created, location: @label
    else
      render json: @label.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /labels/1
  def update
    if @label.update(label_params)
      render json: @label
    else
      render json: @label.errors, status: :unprocessable_content
    end
  end

  # DELETE /labels/1
  def destroy
    @label.destroy!

    render json: {}
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_label
      @label = Label.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def label_params
      params.expect(label: [ :project_id, :name, :color ])
    end
end
