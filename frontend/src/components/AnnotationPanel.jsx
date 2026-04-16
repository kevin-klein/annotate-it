import React from 'react';
import AnnotationItem from './AnnotationItem';
import LabelInput from './LabelInput';

export default function AnnotationPanel ({ project,
  annotations, onDelete, label, onLabelChange,
  labels, onSelectAnnotation, selectedAnnotationId }) {
  return (
    <div className="annotations-panel">
      <div className="panel-header">
        <h3>Annotations ({annotations.length})</h3>
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
              project={project}
              labels={labels}
              annotation={annotation}
              onDelete={onDelete}
              onSelect={onSelectAnnotation}
              isSelected={selectedAnnotationId === annotation.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
