import React from 'react';
import AnnotationItem from './AnnotationItem';

const AnnotationPanel = ({ annotations, onSave, onDelete }) => {
  if (annotations.length === 0) {
    return (
      <div className="annotations-panel">
        <div className="panel-content">
          <div className="empty-state">
            <div className="empty-state-icon">✏️</div>
            <div className="empty-state-title">No annotations yet</div>
            <div className="empty-state-desc">
              Click on the image to create annotations
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="annotations-panel">
      <div className="panel-header">
        <h3>Annotations ({annotations.length})</h3>
        <button
          className="btn-save"
          onClick={onSave}
          disabled={annotations.length === 0}
        >
          Save All
        </button>
      </div>
      <div className="panel-content">
        <div className="annotation-list">
          {annotations.map(annotation => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnotationPanel;
