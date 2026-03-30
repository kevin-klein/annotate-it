import { useState } from 'react';
import useSWR from 'swr';
import { useLocation } from 'wouter';
import { api } from '../services/api';
import ProjectSettings from './ProjectSettings';

const PROJECT_TYPES = [
  {
    id: 'object_detection',
    name: 'Object Detection',
    icon: '🔲',
    description: 'Draw bounding boxes around objects'
  },
  {
    id: 'instance_segmentation',
    name: 'Instance Segmentation',
    icon: '🔷',
    description: 'Draw precise outlines for each object'
  },
  {
    id: 'contrastive_learning',
    name: 'Contrastive Learning',
    icon: '⚖️',
    description: 'Select positive and negative examples'
  }
];

export default function ProjectSelection() {
  const [_, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: projectsData, error, mutate } = useSWR('/api/projects', api.fetcher);
  const projects = projectsData?.projects || [];

  const handleCreateProject = async () => {
    if (!newProjectName || !selectedType) return;

    try {
      const response = await api.post('/api/projects', {
        name: newProjectName,
        description: newProjectDesc,
        project_type: selectedType
      });

      if (response.success) {
        setShowCreate(false);
        setNewProjectName('');
        setNewProjectDesc('');
        setSelectedType(null);
        mutate();
        navigate(`/project/${response.project.id}/images`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}/images`);
  };

  const handleProjectSettings = (project) => {
    setSelectedProject(project);
    setShowSettings(true);
  };

  if (error) {
    return (
      <div className="selection-container">
        <h2 className="title">Select a Project</h2>
        <p className="error">Error loading projects: {error.message}</p>
      </div>
    );
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowCreate(true);
  };

  return (
    <div className="selection-container">
      <h2 className="title">AI Annotation Studio</h2>
      <p className="subtitle">Select or create a project to begin</p>
      <button
        className="btn-create"
        onClick={() => setShowCreate(true)}
        style={{ marginBottom: '1rem' }}
      >
        + New Project
      </button>

      {/* Existing Projects */}
      {projects.length > 0 && (
        <div className="projects-list">
          <h3 className="section-title">Existing Projects</h3>
          {projects.map((project) => (
            <button
              key={project.id}
              className="project-card"
              onClick={() => handleProjectClick(project)}
            >
              <div className="project-icon">{getProjectIcon(project.type)}</div>
              <div className="project-info">
                <h4>{project.name}</h4>
                <p className="project-type">{getProjectTypeLabel(project.type)}</p>
                {project.description && <p className="project-desc">{project.description}</p>}
                <button
                  className="btn-settings"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectSettings(project);
                  }}
                >
                  ⚙️ Settings
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create New Project */}
      <div className="create-section">
        <h3 className="section-title">Create New Project</h3>

        {!showCreate ? (
          <button className="btn-create" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        ) : (
          <div className="create-form">
            <div className="type-selector">
              <p className="type-label">Select Project Type:</p>
              <div className="type-buttons">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-name">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedType && (
              <div className="form-fields">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="form-input"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="form-textarea"
                />
                <div className="form-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-create-new"
                    onClick={handleCreateProject}
                    disabled={!newProjectName}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Settings Modal */}
      {showSettings && selectedProject && (
        <ProjectSettings
          projectId={selectedProject.id}
          project={selectedProject}
          onClose={() => setShowSettings(false)}
          onSave={() => {
            mutate();
          }}
        />
      )}
    </div>
  );
}

function getProjectIcon(type) {
  const icons = {
    object_detection: '🔲',
    instance_segmentation: '🔷',
    contrastive_learning: '⚖️'
  };
  return icons[type] || '📁';
}

function getProjectTypeLabel(type) {
  const labels = {
    object_detection: 'Object Detection',
    instance_segmentation: 'Instance Segmentation',
    contrastive_learning: 'Contrastive Learning'
  };
  return labels[type] || type;
}