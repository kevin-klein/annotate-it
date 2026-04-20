require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @project = projects(:one)
    @user = users(:one)
  end

  test "should get index" do
    token = valid_token(@user)
    get projects_url, headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should create project" do
    token = valid_token(@user)
    assert_difference("Project.count") do
      post projects_url, headers: { "Authorization" => "Bearer #{token}" }, params: { project: { annotation_type: @project.annotation_type, description: @project.description, name: @project.name } }, as: :json
    end

    assert_response :created
  end

  test "should show project" do
    token = valid_token(@user)
    get project_url(@project), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should update project" do
    token = valid_token(@user)
    patch project_url(@project), headers: { "Authorization" => "Bearer #{token}" }, params: { project: { annotation_type: @project.annotation_type, description: @project.description, name: @project.name } }, as: :json
    assert_response :success
  end

  test "should destroy project" do
    token = valid_token(@user)
    assert_difference("Project.count", -1) do
      delete project_url(@project), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    end

    assert_response :no_content
  end
end
