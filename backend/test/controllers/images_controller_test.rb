require "test_helper"

class ImagesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @image = images(:one)
    @user = users(:one)
  end

  test "should get index" do
    token = valid_token(@user)
    get images_url, headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should create image" do
    token = valid_token(@user)
    assert_difference("Image.count") do
      post images_url, headers: { "Authorization" => "Bearer #{token}" }, params: { image: { height: @image.height, project_id: @image.project_id, width: @image.width } }, as: :json
    end

    assert_response :created
  end

  test "should show image" do
    token = valid_token(@user)
    get image_url(@image), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    assert_response :success
  end

  test "should update image" do
    token = valid_token(@user)
    patch image_url(@image), headers: { "Authorization" => "Bearer #{token}" }, params: { image: { height: @image.height, project_id: @image.project_id, width: @image.width } }, as: :json
    assert_response :success
  end

  test "should destroy image" do
    token = valid_token(@user)
    assert_difference("Image.count", -1) do
      delete image_url(@image), headers: { "Authorization" => "Bearer #{token}" }, as: :json
    end

    assert_response :no_content
  end
end
