import React from 'react';

const AnnotationItem = ({ project, labels, annotation, onDelete, onSelect, isSelected }) => {
  const getIconForType = (type) => {
    switch (type) {
      case 'object_detection': return '🔲';
      case 'instance_segmentation': return '🟣';
      case 'contrastive_learning': return '🔵';
      default: return '✏️';
    }
  };

  const renderCoords = () => {
    if (!annotation.data) return null;

    if (project.annotation_type === 'object_detection') {
      return (
        <div className="annotation-coords">
          x: {Math.round(annotation.data[0][0])}, y: {Math.round(annotation.data[0][1])}
        </div>
      );
    }

    if (project.annotation_type === 'instance_segmentation') {
      return (
        <div className="annotation-coords">
          {annotation.data.length} points
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`annotation-item ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(annotation.id);
      }}
    >
      <div className="annotation-info">
        <span className="annotation-type">
          {getIconForType(annotation.type)}
        </span>
        <span className="annotation-label">
          {labels.find(label => label.id === annotation.label_id)?.name || 'Untitled'}
        </span>
      </div>
      {renderCoords()}
      <button
        className="btn-delete"
        onClick={() => onDelete(annotation.id)}
      >
        ✕
      </button>
    </div>
  );
};

export default AnnotationItem;
