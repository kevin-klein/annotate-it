require "test_helper"

class AnnotationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @annotation = annotations(:one)
  end

  test "should get index" do
    get annotations_url, as: :json
    assert_response :success
  end

  test "should create annotation" do
    assert_difference("Annotation.count") do
      post annotations_url, params: { annotation: { data: @annotation.data, image_id: @annotation.image_id, label_id: @annotation.label_id } }, as: :json
    end

    assert_response :created
  end

  test "should show annotation" do
    get annotation_url(@annotation), as: :json
    assert_response :success
  end

  test "should update annotation" do
    patch annotation_url(@annotation), params: { annotation: { data: @annotation.data, image_id: @annotation.image_id, label_id: @annotation.label_id } }, as: :json
    assert_response :success
  end

  test "should destroy annotation" do
    assert_difference("Annotation.count", -1) do
      delete annotation_url(@annotation), as: :json
    end

    assert_response :no_content
  end
end
