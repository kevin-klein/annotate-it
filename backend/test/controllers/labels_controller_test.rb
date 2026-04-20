require "test_helper"

class LabelsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @label = labels(:one)
    @user = users(:one)
  end

  test "should get index" do
    token = valid_token(@user)
    get labels_url, headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should create label" do
    token = valid_token(@user)
    assert_difference("Label.count") do
      post labels_url, headers: { "Authorization" => "Bearer #{token}" }, params: { label: { color: @label.color, name: @label.name, project_id: @label.project_id } }, as: :json
    end

    assert_response :created
  end

  test "should show label" do
    token = valid_token(@user)
    get label_url(@label), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should update label" do
    token = valid_token(@user)
    patch label_url(@label), headers: { "Authorization" => "Bearer #{token}" }, params: { label: { color: @label.color, name: @label.name, project_id: @label.project_id } }, as: :json
    assert_response :success
  end

  test "should destroy label" do
    token = valid_token(@user)
    assert_difference("Label.count", -1) do
      delete label_url(@label), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    end

    assert_response :no_content
  end
end
