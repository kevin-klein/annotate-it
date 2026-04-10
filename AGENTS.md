# Agents Documentation

## Overview

This document describes the agent-based architecture used in the annotation application. The system uses multiple agents to handle different aspects of the annotation workflow.

## Agent Types

### 1. Annotation Agent

**Responsibilities:**
- Creating and managing annotations
- Validating annotation data
- Handling annotation versioning
- Calculating quality scores

**Endpoints:**
- `POST /api/annotations` - Create annotation
- `PUT /api/annotations/:id` - Update annotation
- `GET /api/annotations/:id` - Get annotation details
- `DELETE /api/annotations/:id` - Delete annotation

**Supported Annotation Types:**
- `object_detection` - Bounding box annotations

### 2. Project Management Agent

**Responsibilities:**
- Project creation and management
- Project statistics calculation
- Dataset association

**Endpoints:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### 3. Image Processing Agent

**Responsibilities:**
- Image upload and storage
- Image metadata extraction
- Image statistics calculation

**Endpoints:**
- `POST /api/images` - Upload image
- `GET /api/images?projectId=:id` - List images
- `GET /api/images/:id` - Get image details
- `DELETE /api/images/:id` - Delete image
- `GET /api/images/stats?projectId=:id` - Get image statistics

### 4. Label Management Agent

**Responsibilities:**
- Label creation and management
- Label color configuration
- Project-label association

**Endpoints:**
- `POST /api/labels` - Create label
- `PUT /api/labels/:id` - Update label
- `GET /api/labels` - List labels
- `GET /api/labels/:id` - Get label details
- `DELETE /api/labels/:id` - Delete label

## Agent Communication

Agents communicate through the Rails API endpoints and share data through the SQLite database. The system uses the following database tables:
- **projects**: Stores project metadata and configuration
- **images**: Stores image files and metadata (with Active Storage)
- **annotations**: Stores annotation data with versioning
- **labels**: Stores label definitions with colors
- **active_storage_***: Stores uploaded images and variants

## Setup

Refer to the [Backend Setup Guide](backend/README.md) for installation and configuration instructions.

## Environment Variables
- `RAILS_ENV`: Environment (development, test, production)
- `RAILS_MAX_THREADS`: Maximum threads for Puma server (default: 5)

## Testing

Run agent tests using:
```bash
cd backend && bundle exec rails test
```

Run with coverage:
```bash
cd backend && bundle exec rails test:coverage
```