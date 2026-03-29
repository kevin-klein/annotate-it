# Backend Migration: Node.js to Rails

## Overview

The backend has been migrated from Node.js/Express to Ruby on Rails 7.1 for better maintainability, type safety, and Rails conventions.

## Key Changes

### Architecture
- **Old**: Node.js/Express with custom routing
- **New**: Rails 7.1 with RESTful controllers and routing

### Database
- **Old**: SQLite with custom migration system
- **New**: SQLite with ActiveRecord migrations

### Models
- **Old**: Manual SQL queries
- **New**: ActiveRecord models with validations and associations

### Controllers
- **Old**: Custom Express middleware
- **New**: Standard Rails controllers with JSON responses

### File Uploads
- **Old**: Multer middleware
- **New**: Standard Rails file handling with MiniMagick

## Important: Column Name Changes

Due to Rails reserved keywords, the following column names have been changed:

| Old Column | New Column | Reason |
|------------|------------|--------|
| `projects.type` | `projects.annotation_type` | `type` is reserved for STI |
| `annotations.type` | `annotations.annotation_type` | `type` is reserved for STI |

## File Structure

```
rails_backend/
├── app/
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── projects_controller.rb
│   │   │   ├── images_controller.rb
│   │   │   ├── annotations_controller.rb
│   │   │   ├── uploads_controller.rb
│   │   │   └── backups_controller.rb
│   ├── models/
│   │   ├── project.rb
│   │   ├── image.rb
│   │   └── annotation.rb
│   └── services/
│       ├── image_upload_service.rb
│       └── backup_service.rb
├── config/
│   ├── routes.rb
│   ├── database.yml
│   └── initializers/
├── db/
│   ├── migrate/
│   └── schema.rb
└── bin/
    ├── setup
    └── start
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Images
- `GET /api/images?projectId=:id` - List images
- `POST /api/upload` - Upload image
- `GET /api/images/:id` - Get image
- `DELETE /api/images/:id` - Delete image

### Annotations
- `GET /api/annotations?image_id=:id&annotation_type=:type` - List annotations
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

### Backups
- `GET /api/backups` - List backups
- `POST /api/backups` - Create backup

## Migrations

The existing migration system has been replaced with Rails migrations:

1. `20240101000001_create_projects.rb` - Projects table
2. `20240101000002_create_images.rb` - Images table
3. `20240101000003_create_annotations.rb` - Annotations table
4. `20240101000004_create_migration_records.rb` - Migration tracking
5. `20240101000005_rename_type_to_annotation_type.rb` - Column name fix

## Data Migration

If you need to migrate data from the old Node.js backend, the migration task will handle the column name changes automatically.

## Benefits

1. **Type Safety**: Strongly typed models with validations
2. **Convention over Configuration**: Standard Rails patterns
3. **Built-in Features**: Active Record, Active Job, Action Mailer
4. **Better Testing**: Built-in test framework
5. **Easier Maintenance**: Standard Rails ecosystem
6. **Performance**: Optimized query building and caching

## Next Steps

1. Set up the Rails backend: `bundle install && rails db:create db:migrate`
2. Start server: `rails server -p 3001`
3. Update frontend to use new API endpoints (note: `type` parameter is now `annotation_type`)
