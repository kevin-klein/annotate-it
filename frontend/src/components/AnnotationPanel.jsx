import React from 'react';
import AnnotationItem from './AnnotationItem';
import LabelInput from './LabelInput';
import Toolbar from "./Toolbar";

export default function AnnotationPanel ({ project,
  annotations, onDelete, label, onLabelChange,
  labels, onSelectAnnotation, selectedAnnotationId,
  projectId, api, onLabelAdded, toggleDone, finished, scale, onZoomIn, onZoomOut, projectType, setTool, handleExport, handleZoomIn, handleZoomOut, tool }) {

  return (
    <div className="annotations-panel">
      <Toolbar
					scale={scale}
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					projectType={projectType}
					tool={tool}
					onToolChange={setTool}
					onExport={handleExport}
				/>

      <div className="panel-header">
        <h3>Annotations ({annotations.length})</h3>
      </div>
      <div className="panel-content">
        <div className="annotation-controls">
          <LabelInput
            label={label}
            labels={labels}
            onLabelChange={onLabelChange}
            projectId={projectId}
            api={api}
            onLabelAdded={onLabelAdded}
          />
          <button
            onClick={toggleDone}
            className='tool-btn'
            style={{
              backgroundColor: finished ? 'var(--success)' : 'transparent',
              color: finished ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: finished ? 'none' : '1px solid var(--border-secondary)',
              fontWeight: 500,
              flex: 1,
            }}
          >
            {finished ? '✓ DONE' : 'MARK DONE'}
          </button>
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
