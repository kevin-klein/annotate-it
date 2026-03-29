# Rails Backend Setup Guide

## Prerequisites

- Ruby 3.2+
- Rails 7.1+
- SQLite3

## Quick Start

```bash
# Navigate to Rails backend directory
cd /home/kevin/annotate/rails_backend

# Install dependencies
bundle install

# Create database and run migrations
rails db:create db:migrate

# Start the server
rails server -p 3001
```

## Migrate Existing Data (Optional)

If you want to migrate data from the existing SQLite database:

```bash
# Run the data migration task
rails data:migrate
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
- `GET /api/annotations?image_id=:id` - List annotations
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

### Backups
- `GET /api/backups` - List backups
- `POST /api/backups` - Create backup

## Project Types

- `object_detection` - Bounding box annotations
- `contrastive_learning` - Image pair comparison
- `instance_segmentation` - Pixel-level segmentation

## Environment Variables

- `RAILS_ENV` - Environment (development, test, production)
- `PORT` - Server port (default: 3001)

## Testing

```bash
# Run tests
rails test

# Run with coverage
rails test:coverage
```
