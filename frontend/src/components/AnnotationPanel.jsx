import React from 'react';
import AnnotationItem from './AnnotationItem';
import LabelInput from './LabelInput';

const AnnotationPanel = ({ annotations, onSave, onDelete, label, onLabelChange, labels }) => {
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
        <div className="annotation-controls">
          <LabelInput
            label={label}
            labels={labels}
            onLabelChange={onLabelChange}
          />
        </div>

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
