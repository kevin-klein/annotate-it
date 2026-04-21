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

ActiveRecord::Schema[8.1].define(version: 2026_04_21_233315) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "annotations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "image_id", null: false
    t.integer "label_id", null: false
    t.datetime "updated_at", null: false
    t.index ["image_id"], name: "index_annotations_on_image_id"
    t.index ["label_id"], name: "index_annotations_on_label_id"
  end

  create_table "contrastive_learning_annotations", force: :cascade do |t|
    t.integer "annotation_id", null: false
    t.json "contrastive_points", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["annotation_id"], name: "index_contrastive_learning_annotations_on_annotation_id"
  end

  create_table "images", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "finished", default: false, null: false
    t.integer "height"
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.integer "width"
    t.index ["project_id"], name: "index_images_on_project_id"
  end

  create_table "instance_segmentation_annotations", force: :cascade do |t|
    t.integer "annotation_id", null: false
    t.datetime "created_at", null: false
    t.json "points", null: false
    t.datetime "updated_at", null: false
    t.index ["annotation_id"], name: "index_instance_segmentation_annotations_on_annotation_id"
  end

  create_table "labels", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "name"], name: "index_labels_on_project_id_and_name", unique: true
    t.index ["project_id"], name: "index_labels_on_project_id"
  end

  create_table "object_detection_annotations", force: :cascade do |t|
    t.integer "annotation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "xmax", null: false
    t.decimal "xmin", null: false
    t.decimal "ymax", null: false
    t.decimal "ymin", null: false
    t.index ["annotation_id"], name: "index_object_detection_annotations_on_annotation_id"
  end

  create_table "projects", force: :cascade do |t|
    t.integer "annotation_type"
    t.datetime "created_at", null: false
    t.string "description"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "email", null: false
    t.string "login_code"
    t.datetime "login_code_expiry"
    t.string "old_email"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["old_email"], name: "index_users_on_old_email", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "annotations", "images"
  add_foreign_key "annotations", "labels"
  add_foreign_key "contrastive_learning_annotations", "annotations"
  add_foreign_key "images", "projects"
  add_foreign_key "instance_segmentation_annotations", "annotations"
  add_foreign_key "labels", "projects"
  add_foreign_key "object_detection_annotations", "annotations"
end
