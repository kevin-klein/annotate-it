import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Line, Text as KonvaText, Image as KonvaImage, Group } from 'react-konva';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import { fetcher } from '../services/api';

const Canvas = ({ selectedImage, selectedProjectId, activeAnnotationType, onTypeChange, onAnnotationsSaved }) => {
  const [projectData, setProjectData] = useState(null);
  const [projectType, setProjectType] = useState(null);

  // Fetch project data
  const { data: projectResponse } = useSWR(
    selectedProjectId ? `/api/projects/${selectedProjectId}` : null,
    fetcher
  );

  useEffect(() => {
    if (projectResponse?.project) {
      setProjectData(projectResponse.project);
      setProjectType(projectResponse.project.annotation_type);
      // Set the annotation type based on project type
      if (projectResponse.project.annotation_type && activeAnnotationType !== projectResponse.project.annotation_type) {
        onTypeChange(projectResponse.project.annotation_type);
      }
    }
  }, [projectResponse, activeAnnotationType, onTypeChange]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [label, setLabel] = useState('');
  const [confidence, setConfidence] = useState(1);
  const [annotations, setAnnotations] = useState([]);

  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageObj, setImageObj] = useState(null);

  // Load the image for display
  useEffect(() => {
    if (selectedImage?.file_path) {
      const img = new window.Image();
      img.src = selectedImage.file_path;
      img.onload = () => {
        setImageObj(img);
      };
      img.onerror = () => {
        console.error('Failed to load image:', selectedImage.file_path);
      };
    } else if (selectedImage?.id) {
      // Fetch image if only ID is available
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
  }, [selectedImage]);

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
      // const newAnnotation = {
      //   id: uuidv4(),
      //   image_id: selectedImage.id,
      //   project_id: projectData?.id,
      //   type: projectType,
      //   label: label,
      //   confidence: confidence,
      //   data: null,
      //   metadata: null,
      // };
      // setAnnotations(prev => [...prev, newAnnotation]);
      setLabel('');
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
      setLabel('');
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

    console.log(projectType)
    console.log(drawingPoints.length)

    if (projectType === 'object_detection' && drawingPoints.length === 2) {
      // Create bounding box from 2 points (top-left to bottom-right)
      const [p1, p2] = drawingPoints;
      const x1 = Math.min(p1.x, p2.x);
      const y1 = Math.min(p1.y, p2.y);
      const x2 = Math.max(p1.x, p2.x);
      const y2 = Math.max(p1.y, p2.y);

      // Bounding box format: [x1, y1, x2, y2, x1, y2, x2, y2] (4 corners)
      const points = [
        [x1, y1],  // top-left
        [x2, y1],  // top-right
        [x2, y2],  // bottom-right
        [x1, y2],  // bottom-left
      ];

      console.log('adding annotation: ', { data: points })

      setAnnotations(prev => [...prev, { id: uuidv4(), data: points, annotation_type: 'object_detection' }])

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
      const newAnnotation = {
        id: uuidv4(),
        image_id: selectedImage.id,
        type: projectType,
        label: 'contrastive_point',
        confidence: 1,
        data: null,
        metadata: { contrastivePoints: [drawingPoints[drawingPoints.length - 1]] },
      };
      setAnnotations(prev => [...prev, newAnnotation]);
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

      // Notify parent component that annotations were saved
      if (onAnnotationsSaved) {
        onAnnotationsSaved();
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  };

  const handleDeleteAnnotation = async (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  // const handleDoubleClick = (e) => {
  //   const stage = e.target.getStage();
  //   const pos = stage.getPointerPosition();
  //   const scaledPos = {
  //     x: (pos.x - offset.x) / scale,
  //     y: (pos.y - offset.y) / scale,
  //   };

  //   // Add annotation based on project type
  //   const newAnnotation = {
  //     id: uuidv4(),
  //     image_id: selectedImage.id,
  //     type: projectType,
  //     label: projectType === 'contrastive_learning' ? 'contrastive_point' : '',
  //     confidence: 1,
  //     data: null,
  //     metadata: null,
  //   };

  //   setAnnotations(prev => [...prev, newAnnotation]);
  //   setLabel('');
  //   setConfidence(1);
  // };

  const renderAnnotation = (annotation) => {
    const color = '#7c3aed';

    console.log(annotation)

    if (annotation.annotation_type === 'object_detection') {
      const points = annotation.data;
      console.log('points: ', points)
      if (!points || points.length !== 4) return null;

      console.log('in annotations')

      return (
        <React.Fragment key={annotation.id}>
          <Rect
            x={Math.min(...points.map(p => p[0]))}
            y={Math.min(...points.map(p => p[1]))}
            width={Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0]))}
            height={Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1]))}
            stroke={color}
            strokeWidth={2}
          />
          <KonvaText
            text={annotation.label || 'object'}
            x={Math.min(...points.map(p => p[0]))}
            y={Math.min(...points.map(p => p[1])) - 20}
            fontSize={14}
            fill={color}
            fontStyle="bold"
          />
        </React.Fragment>
      );
    }

    if (annotation.type === 'instance_segmentation') {
      const points = annotation.data;
      if (!points || points.length < 3) return null;

      const polygonPoints = points.flat();
      return (
        <React.Fragment key={annotation.id}>
          <Group>
            {/* Polygon outline */}
            <Line
              points={polygonPoints}
              stroke={color}
              strokeWidth={isSelected ? 3 : 2}
              closed
            />
            {/* Semi-transparent fill using multiple rects */}
            {polygonPoints.map((point, index) => {
              const nextPoint = polygonPoints[(index + 1) % polygonPoints.length];
              return (
                <Rect
                  key={index}
                  x={point[0]}
                  y={point[1]}
                  width={nextPoint[0] - point[0]}
                  height={nextPoint[1] - point[1]}
                  fill={color}
                  opacity={0.3}
                  listening={false}
                />
              );
            })}
          </Group>
          <KonvaText
            text={annotation.label || 'segment'}
            x={polygonPoints[0]}
            y={polygonPoints[1] - 20}
            fontSize={14}
            fill={color}
            fontStyle="bold"
          />
        </React.Fragment>
      );
    }

    if (annotation.type === 'contrastive_learning') {
      const points = annotation.metadata?.contrastivePoints || [];
      return (
        <React.Fragment key={annotation.id}>
          {points.map((point, index) => (
            <React.Fragment key={index}>
              <Rect
                x={point.x - 5}
                y={point.y - 5}
                width={10}
                height={10}
                fill={color}
              />
              <KonvaText
                text={`C${index + 1}`}
                x={point.x + 8}
                y={point.y - 5}
                fontSize={12}
                fill={color}
              />
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return null;
  };

  if (!selectedImage) {
    return (
      <div className="canvas-container" ref={containerRef}>
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <div className="empty-state-title">Select an image</div>
          <div className="empty-state-desc">Choose an image from the sidebar to start annotating</div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container" ref={containerRef}>
      <Stage
        width={containerRef.current?.offsetWidth || 800}
        height={containerRef.current?.offsetHeight || 600}
        scaleX={scale}
        scaleY={scale}
        x={offset.x}
        y={offset.y}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        // onDblClick={handleDoubleClick}
        ref={stageRef}
        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* Image background */}
          {imageObj && (
            <KonvaImage
              image={imageObj}
              x={0}
              y={0}
              width={selectedImage.width}
              height={selectedImage.height}
              listening={false}
            />
          )}

          {/* Existing annotations */}
          {annotations.map(renderAnnotation)}

          {/* Current drawing */}
          {isDrawing && drawingPoints.length == 2 && (
            <React.Fragment>
              {/* {projectType === "object_detection" ( */}
                <Rect
                  x={Math.min(drawingPoints[0].x, drawingPoints[1].x)}
                  y={Math.min(drawingPoints[0].y, drawingPoints[1].y)}
                  width={Math.abs(drawingPoints[1].x - drawingPoints[0].x)}
                  height={Math.abs(drawingPoints[1].y - drawingPoints[0].y)}
                  stroke="#00d4ff"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              {/* ) } */}
              {/* {projectType === 'instance_segmentation' && (
                <Group>
                  <Line
                    points={drawingPoints.flatMap(p => [p.x, p.y])}
                    stroke="#7c3aed"
                    strokeWidth={2}
                    closed
                  />
                  {drawingPoints.map((point, index) => {
                    const nextPoint = drawingPoints[(index + 1) % drawingPoints.length];
                    return (
                      <Rect
                        key={index}
                        x={point.x}
                        y={point.y}
                        width={nextPoint.x - point.x}
                        height={nextPoint.y - point.y}
                        fill="#7c3aed"
                        opacity={0.3}
                        listening={false}
                      />
                    );
                  })}
                </Group>
              )}
              {projectType === 'contrastive_learning' && (
                <React.Fragment>
                  <Rect
                    x={drawingPoints[drawingPoints.length - 1].x - 5}
                    y={drawingPoints[drawingPoints.length - 1].y - 5}
                    width={10}
                    height={10}
                    fill="#00d4ff"
                  />
                  <KonvaText
                    text={`+C${annotations.filter(a => a.type === 'contrastive_learning').length + 1}`}
                    x={drawingPoints[drawingPoints.length - 1].x + 8}
                    y={drawingPoints[drawingPoints.length - 1].y - 5}
                    fontSize={12}
                    fill="#00d4ff"
                  />
                </React.Fragment>
              )} */}
            </React.Fragment>
          )}
        </Layer>
      </Stage>

      {/* Canvas tools overlay */}
      <div className="canvas-overlay">
        <div className="canvas-tools">
          <div className="tool-group">
            {projectType === 'object_detection' && (
              <button className="tool-btn active" disabled>
                🔲 Object Detection
              </button>
            )}
            {projectType === 'instance_segmentation' && (
              <button className="tool-btn active" disabled>
                🟣 Instance Seg
              </button>
            )}
            {projectType === 'contrastive_learning' && (
              <button className="tool-btn active" disabled>
                🔵 Contrastive
              </button>
            )}
          </div>
          <div className="tool-group">
            <button className="tool-btn" onClick={() => setScale(s => Math.min(s * 1.2, 3))}>
              + Zoom
            </button>
            <button className="tool-btn" onClick={() => setScale(s => Math.max(s / 1.2, 0.1))}>
              - Zoom
            </button>
          </div>
        </div>
      </div>

      {/* Annotations panel on the right */}
      <div className="annotations-panel">
        <div className="panel-header">
          <h3>Annotations ({annotations.length})</h3>
          <button
            className="btn-save"
            onClick={handleSaveAllAnnotations}
            disabled={annotations.length === 0}
          >
            Save All
          </button>
        </div>
        <div className="panel-content">
          {annotations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✏️</div>
              <div className="empty-state-title">No annotations yet</div>
              <div className="empty-state-desc">Click on the image to create annotations</div>
            </div>
          ) : (
            <div className="annotation-list">
              {annotations.map(annotation => (
                <div key={annotation.id} className="annotation-item">
                  <div className="annotation-info">
                    <span className="annotation-type">
                      {annotation.type === 'object_detection' && '🔲'}
                      {annotation.type === 'instance_segmentation' && '🟣'}
                      {annotation.type === 'contrastive_learning' && '🔵'}
                    </span>
                    <span className="annotation-label">{annotation.label || 'Untitled'}</span>
                  </div>
                  {annotation.type === 'object_detection' && annotation.data && (
                    <div className="annotation-coords">
                      x: {Math.round(annotation.data[0][0])}, y: {Math.round(annotation.data[0][1])}
                    </div>
                  )}
                  {annotation.type === 'instance_segmentation' && annotation.data && (
                    <div className="annotation-coords">
                      {annotation.data.length} points
                    </div>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Label input panel */}
      {/* Label input panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <input
          type="text"
          placeholder="Label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            padding: '0.5rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            borderRadius: '4px',
          }}
        />
        <input
          type="number"
          placeholder="Confidence"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          min={0}
          max={1}
          step={0.1}
          style={{
            width: '80px',
            padding: '0.5rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            borderRadius: '4px',
          }}
        />
        <button
          className="btn-save"
          onClick={handleSaveAllAnnotations}
          disabled={annotations.length === 0}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Canvas;
