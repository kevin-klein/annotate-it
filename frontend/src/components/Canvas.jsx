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

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setProjectType(project.annotation_type);
      if (project.annotation_type && activeAnnotationType !== project.annotation_type) {
        onTypeChange(project.annotation_type);
      }
    }
  }, [project, activeAnnotationType, onTypeChange]);

  // Tools: Hand for paning, Add for adding annotations

  const [label, setLabel] = useState('');
  const [tool, setTools] = useState('hand')

  const [confidence, setConfidence] = useState(1);
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

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = {
      x: (pos.x - offset.x) / scale,
      y: (pos.y - offset.y) / scale,
    };

    // For object detection, use 2-point drawing
    if (projectType === 'object_detection') {
      setConfidence(1);

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
        label: label,
        confidence: confidence,
        data: null,
        metadata: null,
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setConfidence(1);
    }
  };

  const handleStageMouseMove = (e) => {
     if (!isDrawing || !selectedImage) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scaledPos = {
      x: (pos.x - offset.x) / scale,
      y: (pos.y - offset.y) / scale,
    };

    // For object detection, update the second point (bottom-right corner) for live preview
    // if (projectType === 'object_detection') {
      setDrawingPoints([drawingPoints[0], scaledPos]);
    // }
  };

  const handleStageMouseUp = () => {
    setIsDrawing(false);

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
        annotation_type: 'object_detection',
        label: label,
        confidence: confidence,
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
        confidence: 1,
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
        annotations.map(annotation =>
          fetch('/api/annotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotation),
          })
        )
      );

      if (onAnnotationsSaved) {
        onAnnotationsSaved();
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));

  if (isProjectLoading || isLabelsLoading) {
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
    <div className="canvas-container" ref={containerRef}>
      <DrawingCanvas
        imageObj={imageObj}
        selectedImage={selectedImage}
        scale={scale}
        offset={offset}
        annotations={annotations}
        drawingPoints={drawingPoints}
        projectType={projectType}
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
      />

      <LabelInput
        label={label}
        labels={labels}
        onLabelChange={setLabel}
      />

      <AnnotationPanel
        annotations={annotations}
        onSave={handleSaveAllAnnotations}
        onDelete={handleDeleteAnnotation}
      />
    </div>
  );
};

export default Canvas;
