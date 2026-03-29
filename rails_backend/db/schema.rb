# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_01_01_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "annotations", force: :cascade do |t|
    t.bigint "image_id", null: false
    t.string "annotation_type", null: false
    t.json "data", null: false
    t.string "label"
    t.json "metadata", default: {}
    t.float "confidence"
    t.integer "version", default: 1
    t.float "quality_score"
    t.string "review_status", default: "pending"
    t.string "reviewer"
    t.text "review_notes"
    t.datetime "review_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["annotation_type"], name: "index_annotations_on_annotation_type"
    t.index ["image_id"], name: "index_annotations_on_image_id"
    t.index ["version"], name: "index_annotations_on_version"
  end

  create_table "images", force: :cascade do |t|
    t.string "filename", null: false
    t.string "original_name", null: false
    t.string "file_path", null: false
    t.integer "width", null: false
    t.integer "height", null: false
    t.bigint "project_id"
    t.json "metadata", default: {}
    t.string "checksum"
    t.string "export_path"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_images_on_created_at"
    t.index ["project_id"], name: "index_images_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "annotation_type", default: "object_detection", null: false
    t.string "dataset_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["annotation_type"], name: "index_projects_on_annotation_type"
    t.index ["created_at"], name: "index_projects_on_created_at"
  end

  add_foreign_key "annotations", "images"
end
