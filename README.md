# Image Annotation Platform

A full-stack web application for collaborative image annotation with support for object detection and instance segmentation workflows.

## Overview

This project provides a complete image annotation system with:

- **Backend**: Rails 8 API with RESTful endpoints
- **Frontend**: React application with Konva for interactive canvas annotation
- **Storage**: Active Storage for image uploads and management
- **Background Processing**: Solid Queue for async operations

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                       │
│  • Project selection dashboard                                  │
│  • Image gallery with sidebar                                   │
│  • Interactive annotation canvas (Konva)                        │
│  • Real-time annotation editing and preview                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ REST API (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Backend (Rails 8)                      │
│  • RESTful API endpoints                                        │
│  • Active Storage integration                                   │
│  • Solid Queue background jobs                                  │
│  • PostgreSQL database                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Project Management
- Create and manage annotation projects
- Configure annotation types (object detection, instance segmentation, contrastive learning)
- Set up color-coded labels for different annotation categories

### Image Handling
- Upload images with automatic metadata extraction
- Support for various image formats
- Image display with zoom and pan capabilities
- Active Storage integration for file management

### Annotation Tools
- **Object Detection**: Draw bounding boxes around objects
- **Instance Segmentation**: Draw polygon outlines for precise object boundaries
- **Contrastive Learning**: Mark positive/negative sample points

### Canvas Interactions
- Zoom in/out with mouse wheel
- Pan/pan mode for navigating large images
- Tool selection (hand for panning, add for annotations)
- Real-time annotation preview
- Annotation selection and editing

## Installation

### Prerequisites

- Ruby 3.x (see `.ruby-version`)
- Node.js 18+
- PostgreSQL
- ImageMagick (for Active Storage variants)

### Setup

#### 1. Backend Setup

```bash
cd backend
bundle install
rails db:create
rails db:migrate
```

#### 2. Frontend Setup

```bash
cd frontend
yarn install
```

### Development

#### Start Backend Server

```bash
cd backend
rails server
```

#### Start Frontend Dev Server

```bash
cd frontend
yarn dev
```

The application will be available at `http://localhost:5173` (frontend) with API at `http://localhost:3000`.

## API Documentation

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images?project_id=:id` | List images for project |
| GET | `/api/images/:id` | Get image details |
| POST | `/api/images` | Upload image |
| PUT | `/api/images/:id` | Update image |
| DELETE | `/api/images/:id` | Delete image |

### Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labels` | List all labels |
| GET | `/api/labels/:id` | Get label details |
| POST | `/api/labels` | Create label |
| PUT | `/api/labels/:id` | Update label |
| DELETE | `/api/labels/:id` | Delete label |

### Annotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/annotations` | List all annotations |
| GET | `/api/annotations/:id` | Get annotation details |
| POST | `/api/annotations` | Create annotation |
| PUT | `/api/annotations/:id` | Update annotation |
| DELETE | `/api/annotations/:id` | Delete annotation |

## Annotation Data Format

Annotations are stored as JSON with the following structure:

```json
{
  "id": 1,
  "image_id": 5,
  "label_id": 3,
  "type": "object_detection",
  "data": [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2]
  ],
  "created_at": "2026-04-12T...",
  "updated_at": "2026-04-12T..."
}
```

## Testing

### Backend Tests

```bash
cd backend
bundle exec rails test
bundle exec rails test:coverage
```

### Frontend Tests

```bash
cd frontend
yarn test
```

## Deployment

The application is containerized with Docker. See `backend/Dockerfile` for the container image.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `RAILS_ENV` | Environment (development, test, production) |
| `SOLID_QUEUE_IN_PUMA` | Enable Solid Queue in Puma (optional) |

## Project Structure

### Backend

```
backend/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── serializers/
│   └── views/
├── config/
├── db/
│   ├── migrate/
│   └── seeds.rb
├── test/
└── Gemfile
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Canvas.jsx
│   │   ├── DrawingCanvas.jsx
│   │   ├── Toolbar.jsx
│   │   ├── AnnotationPanel.jsx
│   │   └── LabelInput.jsx
│   ├── hooks/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
