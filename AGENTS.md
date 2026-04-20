# Agents Documentation

## Overview

This document describes the REST API architecture used in the Rails annotation application. The system provides RESTful endpoints for managing annotation projects, images, labels, and annotations.

## API Resources

### 1. Annotations Resource

**Responsibilities:**
- Creating and managing annotation records
- Storing annotation data in JSON format
- Linking annotations to images and labels

**Endpoints:**
- `GET /api/annotations` - List all annotations
- `GET /api/annotations/:id` - Get annotation details
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

**Request/Response:**
- Parameters: `image_id`, `data`, `label_id`
- Returns JSON representation of annotation

### 2. Labels Resource

**Responsibilities:**
- Label creation and management
- Label color configuration
- Project-label association

**Endpoints:**
- `GET /api/labels` - List all labels
- `GET /api/labels/:id` - Get label details
- `POST /api/labels` - Create label
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label

**Request/Response:**
- Parameters: `project_id`, `name`, `color`
- Returns JSON representation of label

### 3. Images Resource

**Responsibilities:**
- Image upload and storage via Active Storage
- Image metadata extraction (width, height)
- Project-specific image listing

**Endpoints:**
- `GET /api/images?project_id=:id` - List images for a project
- `GET /api/images/:id` - Get image details
- `POST /api/images` - Upload image
- `PUT /api/images/:id` - Update image
- `DELETE /api/images/:id` - Delete image

**Request/Response:**
- Parameters: `project_id`, `image` (file upload)
- Response includes: `id`, `width`, `height`, `created_at`, `updated_at`, `file_path`

### 4. Projects Resource

**Responsibilities:**
- Project creation and management
- Annotation type configuration
- Project metadata storage

**Endpoints:**
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Request/Response:**
- Parameters: `name`, `description`, `annotation_type`
- Returns JSON representation of project

## Frontend Overview

The frontend is a React application built with Vite. It uses `konva` and `react-konva` for canvas-based annotations and `swr` for data fetching.

### Directory Structure

├── `src/`
│   ├── `components/` - Reusable UI components
│   ├── `context/` - React Context for state management
│   ├── `hooks/` - Custom React hooks
│   ├── `services/` - API interaction logic
│   ├── `utils/` - Helper functions
│   └── `App.jsx` - Main application component

### Setup

Install dependencies:

```bash
cd frontend && npm install
```

Run development server:

```bash
cd frontend && npm run dev
```

Build for production:

```bash
cd frontend && npm run build
```

## API Communication

The API uses Rails RESTful routing with JSON serialization. All endpoints are prefixed with `/api`. The system uses the following database tables:

- **projects**: Stores project metadata (name, description, annotation_type)
- **images**: Stores image metadata with Active Storage (project_id, width, height)
- **annotations**: Stores annotation data (image_id, label_id, data JSON)
- **labels**: Stores label definitions (project_id, name, color)
- **active_storage_***: Stores uploaded images and variants

## Setup

Refer to the [Backend README](backend/README.md) for installation and configuration instructions.

## Environment Variables

- `RAILS_ENV`: Environment (development, test, production)
- `SOLID_QUEUE_IN_PUMA`: Enable Solid Queue in Puma (optional)

## Testing

Run API tests using:

```bash
cd backend && bundle exec rails test
```

Run with coverage:

```bash
cd backend && bundle exec rails test:coverage
```

Run frontend tests using:

```bash
cd frontend && npm test
```
