import React, { useState } from 'react';
import { useLocation } from 'wouter';
import useSWR from 'swr';
import { authenticatedApi as api } from '../services/auth';

const ProjectSettings = ({ projectId, onClose, onSave }) => {
  const [_, navigate] = useLocation();
  const [newLabel, setNewLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: project, isLoading: isProjectLoading, error: projectError } = useSWR(
    projectId ? `/api/projects/${projectId}` : null,
    api.fetcher
  );

  const { data: labels, isLoading: isLabelsLoading, error: labelsError, mutate: mutateLabels } = useSWR(
    projectId ? `/api/labels?projectId=${projectId}` : null,
    api.fetcher
  );

  if (isLabelsLoading || isProjectLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="project-settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="upload-modal-header">
            <h2>Project Settings</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="upload-drop-zone" style={{ minHeight: 'auto', padding: '2rem' }}>
            <p className="error">Data is loading ...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;

    const trimmedLabel = newLabel.trim();
    if (labels.includes(trimmedLabel)) return;

    try {
      const response = await api.post('/api/labels', {
        project_id: projectId,
        name: trimmedLabel
      });

      setNewLabel('');
      mutateLabels();
    } catch (error) {
      console.error('Error adding label:', error);
      alert(`Failed to add label: ${error.message}`);
    }
  };

  const handleRemoveLabel = async (label) => {
    try {
      const response = await api.deleteLabel(label.id);
      mutateLabels();
    } catch (error) {
      console.error('Error removing label:', error);
      alert(`Failed to remove label: ${error.message}`);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated images and annotations.')) {
      try {
        await api.deleteProject(projectId);
        navigate('/');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // Show error if project data failed to load
  if (projectError) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="project-settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="upload-modal-header">
            <h2>Project Settings</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="upload-drop-zone" style={{ minHeight: 'auto', padding: '2rem' }}>
            <p className="error">Error loading project: {projectError.message}</p>
          </div>
          <div className="upload-footer">
            <button className="btn-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if labels failed to load
  if (labelsError) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="project-settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="upload-modal-header">
            <h2>Project Settings</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="upload-drop-zone" style={{ minHeight: 'auto', padding: '2rem' }}>
            <p className="error">Error loading labels: {labelsError.message}</p>
          </div>
          <div className="upload-footer">
            <button className="btn-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const projectType = project?.type || 'object_detection';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h2>Project Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="upload-drop-zone" style={{ minHeight: 'auto', padding: '2rem' }}>
          <div className="settings-section">
            <h3>Labels</h3>
            <p className="section-desc">
              Configure the labels for this project. These labels will appear in the annotation panel.
            </p>

            {/* Loading indicator */}
            {project && !labels && (
              <div className="loading-indicator">
                <span className="spinner"></span>
                <p>Loading labels...</p>
              </div>
            )}

            <div className="label-input">
              <input
                type="text"
                placeholder="Add a new label..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
              />
              <button
                className="btn-add"
                onClick={handleAddLabel}
                disabled={!newLabel.trim() || labels.includes(newLabel.trim())}
              >
                Add
              </button>
            </div>

            {labels.length === 0 ? (
              <div className="empty-labels">
                <p>No labels configured yet.</p>
                <p className="small">Add labels above to get started.</p>
              </div>
            ) : (
              <div className="labels-list">
                {labels.map((label) => {
                  return (
                    <div key={label.name} className="label-item">
                      <span className="label-name">{label.name}</span>
                      {label.color && (
                        <span
                          className="label-color-indicator"
                          style={{ backgroundColor: label.color }}
                          title={`Color: ${label.color}`}
                        />
                      )}
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveLabel(label)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {projectType !== 'contrastive_learning' && (
            <div className="settings-section">
              <h3>Annotation Type</h3>
              <p className="section-desc">
                The type of annotations this project supports.
              </p>

              <div className="type-info">
                <p><strong>{getProjectTypeName(projectType)}</strong></p>
                <p className="small">{getProjectTypeDescription(projectType)}</p>
              </div>
            </div>
          )}

          {projectType === 'contrastive_learning' && (
            <div className="settings-section">
              <h3>Contrastive Learning</h3>
              <p className="section-desc">
                This project type is used for selecting positive and negative examples for contrastive learning.
              </p>

              <div className="contrastive-info">
                <p>Positive examples will be highlighted in blue.</p>
                <p className="small">Negative examples will be highlighted in red.</p>
              </div>
            </div>
          )}
        </div>

        <div className="upload-footer">
          <button className="btn-danger" onClick={handleDeleteProject}>
            Delete Project
          </button>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-create-new"
              // onClick={handleSave}
              // disabled={isSaving || labels.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getProjectTypeName(type) {
  const names = {
    object_detection: 'Object Detection',
    instance_segmentation: 'Instance Segmentation',
    contrastive_learning: 'Contrastive Learning'
  };
  return names[type] || type;
}

function getProjectTypeDescription(type) {
  const descriptions = {
    object_detection: 'Draw bounding boxes around objects. Configure labels to name your annotations.',
    instance_segmentation: 'Draw precise outlines for each object. Configure labels to name your segments.',
    contrastive_learning: 'Select positive and negative examples for training contrastive models.'
  };
  return descriptions[type] || '';
}

export default ProjectSettings;
