# Rails Backend for Annotation Application

## Setup

```bash
# Install dependencies
bundle install

# Create database and run migrations
rails db:create db:migrate

# Start server
rails server -p 3001
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Images
- `GET /api/images?projectId=:id` - List images for a project
- `GET /api/images/:id` - Get image details
- `DELETE /api/images/:id` - Delete image
- `GET /api/images/stats?projectId=:id` - Get image statistics

### Annotations
- `GET /api/annotations?image_id=:id&annotation_type=:type` - List annotations
- `GET /api/annotations/:id` - Get annotation details
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

### Uploads
- `POST /api/upload` - Upload image (multipart/form-data)
  - Parameters: `image` (file), `projectId` (string)

### Backups
- `GET /api/backups` - List backups
- `POST /api/backups` - Create backup

## Project Types

- `object_detection` - Bounding box annotations
- `contrastive_learning` - Image pair comparison
- `instance_segmentation` - Pixel-level segmentation

## Database Schema

- **projects**: id, name, description, annotation_type, dataset_id, timestamps
- **images**: id, filename, original_name, file_path, width, height, project_id, metadata, timestamps
- **annotations**: id, image_id, annotation_type, data, label, metadata, confidence, version, quality_score, review_status, timestamps
