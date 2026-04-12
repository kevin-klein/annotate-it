import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import { fetcher } from '../services/api';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import AnnotationPanel from './AnnotationPanel';
import LabelInput from './LabelInput';

const Canvas = ({
  selectedImage,
  selectedProjectId,
  activeAnnotationType,
  onTypeChange,
  onAnnotationsSaved,
}) => {
  const [exporting, setExporting] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [projectType, setProjectType] = useState(null);

  const { data: project, isLoading: isProjectLoading } = useSWR(
    selectedProjectId ? `/api/projects/${selectedProjectId}` : null,
    fetcher
  );

  const { data: labels, isLoading: isLabelsLoading, error: labelsError, mutate: mutateLabels } = useSWR(
    selectedProjectId ? `/api/labels?projectId=${selectedProjectId}` : null,
    fetcher
  );

  const { data: existingAnnotations, isLoading: isAnnotationsLoading, error: annotationsError } = useSWR(
    selectedProjectId ? `/api/annotations?image_id=${selectedImage.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setProjectType(project.annotation_type);
      if (project.annotation_type && activeAnnotationType !== project.annotation_type) {
        onTypeChange(project.annotation_type);
      }
    }
  }, [project, activeAnnotationType, onTypeChange]);

  React.useEffect(() => {
    if(existingAnnotations) {
      setAnnotations(existingAnnotations)
    }
  }, [existingAnnotations])

  // Tools: Hand for paning, Add for adding annotations

  const [label, setLabel] = useState({});
  const [tool, setTool] = useState('hand');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  const [annotations, setAnnotations] = useState([]);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);

  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (selectedImage?.file_path) {
      const img = new window.Image();
      img.src = selectedImage.file_path;
      img.onload = () => setImageObj(img);
      img.onerror = () => {
        console.error('Failed to load image:', selectedImage.file_path);
      };
    } else if (selectedImage?.id) {
      fetch(`/api/images/${selectedImage.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.image?.url) {
            const img = new window.Image();
            img.src = data.image.url;
            img.onload = () => setImageObj(img);
            img.onerror = () => {
              console.error('Failed to load image:', data.image.url);
            };
          }
        })
        .catch(err => console.error('Error fetching image:', err));
    }
  }, [selectedImage]);

  useEffect(() => {
    if (containerRef.current && selectedImage) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const scaleX = width / selectedImage.width;
      const scaleY = height / selectedImage.height;
      const newScale = Math.min(scaleX, scaleY) * 0.9;
      setScale(newScale);
      setOffset({
        x: (width - selectedImage.width * newScale) / 2,
        y: (height - selectedImage.height * newScale) / 2,
      });
    }
  }, [selectedImage, containerRef.current]);
  const handleStageMouseDown = (e) => {
    if (e.evt.button !== 0) return;

    if (tool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    if (tool !== 'add' || !selectedImage) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = {
      x: (pos.x - offset.x) / scale,
      y: (pos.y - offset.y) / scale,
    };

    // For object detection, use 2-point drawing
    if (projectType === 'object_detection') {
      // Add first point (top-left corner)
      setDrawingPoints([scaledPos]);
      setIsDrawing(true);
    } else {
      // For other types, use multi-point drawing
      setIsDrawing(true);
      setDrawingPoints([scaledPos]);

      const newAnnotation = {
        id: uuidv4(),
        image_id: selectedImage.id,
        project_id: projectData?.id,
        type: projectType,
        label_id: label.id,
        data: null,
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const handleStageMouseMove = (e) => {
    if (!selectedImage) return;

    if (isPanning) {
      const dx = e.evt.clientX - panStart.x;
      const dy = e.evt.clientY - panStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    if (!isDrawing || tool !== 'add') return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = {
      x: (pos.x - offset.x) / scale,
      y: (pos.y - offset.y) / scale,
    };

    // For object detection, update the second point (bottom-right corner) for live preview
    setDrawingPoints([drawingPoints[0], scaledPos]);
  };

  const handleStageMouseUp = () => {
    setIsPanning(false);
    setIsDrawing(false);

    if (tool !== 'add') {
      setDrawingPoints([]);
      return;
    }

    if (projectType === 'object_detection' && drawingPoints.length === 2) {
      const [p1, p2] = drawingPoints;
      const x1 = Math.min(p1.x, p2.x);
      const y1 = Math.min(p1.y, p2.y);
      const x2 = Math.max(p1.x, p2.x);
      const y2 = Math.max(p1.y, p2.y);

      const points = [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ];

      setAnnotations(prev => [...prev, {
        id: uuidv4(),
        data: points,
        label_id: label.id,
        image_id: selectedImage.id,
      }]);
    } else if (projectType === 'instance_segmentation' && drawingPoints.length >= 3) {
      setAnnotations(prev => {
        const newAnnotations = [...prev];
        if (newAnnotations.length > 0) {
          newAnnotations[newAnnotations.length - 1] = {
            ...newAnnotations[newAnnotations.length - 1],
            data: drawingPoints.map(p => [p.x, p.y]),
          };
        }
        return newAnnotations;
      });
    } else if (projectType === 'contrastive_learning') {
      setAnnotations(prev => [...prev, {
        id: uuidv4(),
        image_id: selectedImage.id,
        type: projectType,
        label: 'contrastive_point',
        data: null,
        metadata: { contrastivePoints: [drawingPoints[drawingPoints.length - 1]] },
      }]);
    }

    setDrawingPoints([]);
  };
  const handleSaveAllAnnotations = async () => {
    if (annotations.length === 0) return;

    try {
      await Promise.all(
        annotations.map(annotation => {
          const {id, data, label_id, image_id} = annotation;

          return fetch('/api/annotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ annotation: {id, label_id, data, image_id} }),
          })
        })
      );

      if (onAnnotationsSaved) {
        onAnnotationsSaved();
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  const handleUpdateAnnotation = (updatedAnnotation) => {
    setAnnotations(prev =>
      prev.map(a => (a.id === updatedAnnotation.id ? updatedAnnotation : a))
    );
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if(typeof id === 'number') {
      fetch(`/api/annotations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      })
    }

    setSelectedAnnotationId(null);
  };

  const handleAnnotationSelect = (id) => {
    setSelectedAnnotationId(id);
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));

  const handleWheel = (e) => {
    e.preventDefault();

    // Determine zoom direction based on scroll delta
    const delta = e.deltaY > 0 ? -1 : 1;
    const zoomFactor = 1.1;

    if (delta > 0) {
      // Zoom in
      setScale(s => Math.min(s * zoomFactor, 3));
    } else {
      // Zoom out
      setScale(s => Math.max(s / zoomFactor, 0.1));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/projects/${selectedProjectId}/export`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export project. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (isProjectLoading || isLabelsLoading || isAnnotationsLoading) {
    return (
      <div className="canvas-container" ref={containerRef}>
        <div className="canvas-loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-message">
            {isProjectLoading ? 'Loading project...' : 'Loading labels...' }
          </p>
          <div className="loading-progress">
            <div className="loading-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container" ref={containerRef} onWheel={handleWheel}>
      <DrawingCanvas
        project={project}
        imageObj={imageObj}
        selectedImage={selectedImage}
        scale={scale}
        offset={offset}
        labels={labels}
        annotations={annotations}
        drawingPoints={drawingPoints}
        projectType={projectType}
        selectedAnnotationId={selectedAnnotationId}
        onSelectAnnotation={handleAnnotationSelect}
        onUpdateAnnotation={handleUpdateAnnotation}
        onStageMouseDown={handleStageMouseDown}
        onStageMouseMove={handleStageMouseMove}
        onStageMouseUp={handleStageMouseUp}
        stageRef={stageRef}
        containerRef={containerRef}
      />

      <Toolbar
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        projectType={projectType}
        tool={tool}
        onToolChange={setTool}
        onExport={handleExport}
      />

      <AnnotationPanel
        project={project}
        label={label}
        labels={labels}
        onLabelChange={setLabel}
        annotations={annotations}
        onSave={handleSaveAllAnnotations}
        onDelete={handleDeleteAnnotation}
        onSelectAnnotation={handleAnnotationSelect}
        selectedAnnotationId={selectedAnnotationId}
      />
    </div>
  );
};

export default Canvas;
