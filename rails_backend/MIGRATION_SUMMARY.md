# Rails Backend Migration Summary

## What Changed

### Backend Technology
- **Before**: Node.js with Express
- **After**: Ruby on Rails 7.1

### Database
- **Before**: SQLite with custom migrations
- **After**: SQLite with ActiveRecord migrations

### Column Name Changes

Due to Rails reserved keywords, the following columns have been renamed:

| Old Column | New Column | Affected Table |
|------------|------------|----------------|
| `type` | `annotation_type` | `projects` |
| `type` | `annotation_type` | `annotations` |

**Reason**: `type` is a reserved column name in Rails for Single Table Inheritance (STI).

## File Structure

```
rails_backend/
├── app/
│   ├── controllers/api/       # RESTful API controllers
│   │   ├── projects_controller.rb
│   │   ├── images_controller.rb
│   │   ├── annotations_controller.rb
│   │   ├── uploads_controller.rb
│   │   └── backups_controller.rb
│   ├── models/                # ActiveRecord models
│   │   ├── project.rb
│   │   ├── image.rb
│   │   └── annotation.rb
│   └── services/              # Business logic
│       ├── image_upload_service.rb
│       └── backup_service.rb
├── config/
│   ├── routes.rb              # API routing
│   ├── database.yml           # Database configuration
│   └── initializers/          # Configuration
├── db/
│   ├── migrate/               # Database migrations
│   └── schema.rb              # Database schema
└── bin/
    ├── setup                  # Setup script
    └── start                  # Start server script
```

## API Endpoints (Updated)

### Projects
```
GET    /api/projects          - List all projects
POST   /api/projects          - Create project (use annotation_type)
GET    /api/projects/:id      - Get project
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
GET    /api/projects/:id/stats - Get project stats
```

### Images
```
GET    /api/images            - List images
GET    /api/images?projectId=:id - Filter by project
GET    /api/images/:id        - Get image
DELETE /api/images/:id        - Delete image
GET    /api/images/stats      - Get image stats
```

### Annotations
```
GET    /api/annotations       - List annotations (use annotation_type)
GET    /api/annotations/:id   - Get annotation
POST   /api/annotations       - Create annotation (use annotation_type)
PUT    /api/annotations/:id   - Update annotation
DELETE /api/annotations/:id   - Delete annotation
```

### Uploads
```
POST   /api/upload            - Upload image
```

### Backups
```
GET    /api/backups           - List backups
POST   /api/backups           - Create backup
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   cd /home/kevin/annotate/rails_backend
   bundle install
   ```

2. **Create database**:
   ```bash
   rails db:create
   ```

3. **Run migrations**:
   ```bash
   rails db:migrate
   ```

4. **Start server**:
   ```bash
   rails server -p 3001
   ```

5. **Migrate existing data** (optional):
   ```bash
   rails data:migrate
   ```

## Key Features

### Models
- **Project**: name, description, annotation_type, dataset_id
- **Image**: filename, original_name, file_path, width, height, project_id
- **Annotation**: annotation_type, data, label, metadata, confidence, version

### Validations
- All models have proper validations
- Type constraints for project and annotation types
- Required fields enforced

### Associations
- Project has_many :images
- Image belongs_to :project
- Image has_many :annotations
- Annotation belongs_to :image

### Services
- **ImageUploadService**: Handles image uploads with validation
- **BackupService**: Creates and manages database backups

## Database Schema

### projects
- `id` (string, primary key)
- `name` (string, required)
- `description` (text)
- `annotation_type` (string, required) - values: object_detection, contrastive_learning, instance_segmentation
- `dataset_id` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

### images
- `id` (string, primary key)
- `filename` (string, required)
- `original_name` (string, required)
- `file_path` (string, required)
- `width` (integer, required)
- `height` (integer, required)
- `project_id` (string, foreign key)
- `metadata` (jsonb)
- `checksum` (string)
- `export_path` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

### annotations
- `id` (string, primary key)
- `image_id` (string, foreign key)
- `annotation_type` (string, required) - values: object_detection, contrastive_learning, instance_segmentation
- `data` (jsonb, required)
- `label` (string)
- `metadata` (jsonb)
- `confidence` (float)
- `version` (integer)
- `quality_score` (float)
- `review_status` (string)
- `reviewer` (string)
- `review_notes` (text)
- `review_date` (datetime)
- `created_at` (datetime)
- `updated_at` (datetime)

## Benefits

1. **Type Safety**: Strongly typed models and validations
2. **Convention over Configuration**: Standard Rails patterns
3. **Built-in Features**: Active Record, Active Job, Action Mailer
4. **Better Testing**: Built-in test framework
5. **Easier Maintenance**: Standard Rails ecosystem
6. **Performance**: Optimized query building and caching

## Migration from Node.js

To migrate existing data from the Node.js backend:

```bash
cd /home/kevin/annotate/rails_backend
rails data:migrate
```

This will copy all projects, images, and annotations from the old SQLite database.

## Testing

```bash
# Run all tests
rails test

# Run specific test file
rails test test/controllers/api/projects_controller_test.rb
```

## Environment Variables

- `RAILS_ENV` - Environment (development, test, production)
- `PORT` - Server port (default: 3001)
- `RAILS_MAX_THREADS` - Database connection pool size

## Next Steps

1. Set up the Rails backend
2. Migrate existing data
3. Update frontend to use `annotation_type` instead of `type`
4. Deploy to production
