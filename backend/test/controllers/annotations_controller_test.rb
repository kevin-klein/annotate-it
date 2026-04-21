require "test_helper"

class AnnotationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @annotation = annotations(:one)
    @user = users(:one)
  end

  test "should get index" do
    token = valid_token(@user)
    get annotations_url, headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should create annotation" do
    token = valid_token(@user)
    assert_difference("Annotation.count") do
      post annotations_url, headers: { "Authorization" => "Bearer #{token}" }, params: { annotation: { image_id: @annotation.image_id, label_id: @annotation.label_id, data: [[10, 20], [100, 20], [100, 200], [10, 200]] } }, as: :json
    end

    assert_response :created
  end

  test "should show annotation" do
    token = valid_token(@user)
    get annotation_url(@annotation), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should update annotation" do
    token = valid_token(@user)
    patch annotation_url(@annotation), headers: { "Authorization" => "Bearer #{token}" }, params: { annotation: { data: [[15, 25], [105, 25], [105, 205], [15, 205]] } }, as: :json
    assert_response :success
  end

  test "should destroy annotation" do
    token = valid_token(@user)
    assert_difference("Annotation.count", -1) do
      delete annotation_url(@annotation), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    end

    assert_response :no_content
  end
end
