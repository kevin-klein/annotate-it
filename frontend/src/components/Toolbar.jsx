import React from 'react';

const Toolbar = ({ scale, onZoomIn, onZoomOut, projectType }) => {
  const getToolLabel = (type) => {
    switch (type) {
      case 'object_detection': return 'Object Detection';
      case 'instance_segmentation': return 'Instance Segmentation';
      case 'contrastive_learning': return 'Contrastive Learning';
      default: return 'Annotation Tool';
    }
  };

  return (
    <div className="canvas-overlay">
      <div className="canvas-tools">
        <div className="tool-group">
          {projectType && (
            <button className="tool-btn active" disabled>
              {getToolLabel(projectType)}
            </button>
          )}
        </div>
        <div className="tool-group">
          <button className="tool-btn" onClick={onZoomIn}>
            + Zoom
          </button>
          <button className="tool-btn" onClick={onZoomOut}>
            - Zoom
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
