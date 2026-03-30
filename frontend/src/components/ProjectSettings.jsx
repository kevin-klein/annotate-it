import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { api } from '../services/api';

const ProjectSettings = ({ projectId, onClose, onSave, project }) => {
  const [_, navigate] = useLocation();
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch project labels
  useEffect(() => {
    if (projectId) {
      api.getProject(projectId).then((data) => {
        if (data.project) {
          setLabels(data.project.labels || []);
        }
      });
    }
  }, [projectId]);

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateProject(projectId, { labels });
      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving labels:', error);
    } finally {
      setIsSaving(false);
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
                {labels.map((label) => (
                  <div key={label} className="label-item">
                    <span className="label-name">{label}</span>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveLabel(label)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
              onClick={handleSave}
              disabled={isSaving || labels.length === 0}
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