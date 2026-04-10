import React from 'react';

const AnnotationItem = ({ annotation, onDelete }) => {
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

    if (annotation.type === 'object_detection') {
      return (
        <div className="annotation-coords">
          x: {Math.round(annotation.data[0][0])}, y: {Math.round(annotation.data[0][1])}
        </div>
      );
    }

    if (annotation.type === 'instance_segmentation') {
      return (
        <div className="annotation-coords">
          {annotation.data.length} points
        </div>
      );
    }

    return null;
  };

  return (
    <div className="annotation-item">
      <div className="annotation-info">
        <span className="annotation-type">
          {getIconForType(annotation.type)}
        </span>
        <span className="annotation-label">
          {annotation.label || 'Untitled'}
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
