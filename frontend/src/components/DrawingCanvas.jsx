import React, { useRef } from 'react';
import { Stage, Layer, Rect, Line, Text as KonvaText, Image as KonvaImage, Group, Transformer } from 'react-konva';

const DrawingCanvas = ({
  imageObj,
  selectedImage,
  scale,
  offset,
  labels,
  annotations,
  drawingPoints,
  projectType,
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onStageMouseDown,
  onStageMouseMove,
  onStageMouseUp,
  stageRef,
  project,
  containerRef,
}) => {
  const transformerRef = useRef(null);
  const annotationRefs = useRef({});
  const contrastiveCount = annotations.filter(a => a.type === 'contrastive_learning').length;
  const isSelected = (annotation) => {
    return selectedAnnotationId === annotation.id;
  };

  const handleAnnotationClick = (e, annotation) => {
    e.cancelBubble = true;
    onSelectAnnotation(annotation.id);
  };

  const updateTransformer = (annotationId) => {
    if (transformerRef.current && annotationRefs.current[annotationId]) {
      transformerRef.current.nodes([annotationRefs.current[annotationId]]);
    }
  };

  React.useEffect(() => {
    updateTransformer(selectedAnnotationId);
  }, [selectedAnnotationId]);

  const handleTransformEnd = (e) => {
    const node = e.target;
    const annotationId = node.id();
    if (!annotationId || !transformerRef.current || !onUpdateAnnotation) return;

    const { x, y, width, height } = node.attrs;

    // Find the annotation and update its data
    onUpdateAnnotation({
      id: annotationId,
      data: [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ],
    });
  };

  const renderAnnotation = (annotation) => {
    const color = isSelected(annotation) ? '#00d4ff' : '#7c3aed';
    const isSelectedAnnotation = isSelected(annotation);

    if (project.annotation_type === 'object_detection') {
      const points = annotation.data;
      if (!points || points.length !== 4) return null;

      const x = Math.min(...points.map(p => p[0]));
      const y = Math.min(...points.map(p => p[1]));
      const width = Math.max(...points.map(p => p[0])) - x;
      const height = Math.max(...points.map(p => p[1])) - y;

      return (
        <React.Fragment key={annotation.id}>
          <Group
            ref={(node) => {
              if (node) {
                annotationRefs.current[annotation.id] = node;
              } else {
                delete annotationRefs.current[annotation.id];
              }
            }}
            onClick={(e) => handleAnnotationClick(e, annotation)}
            onDblClick={(e) => handleAnnotationClick(e, annotation)}
          >
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              stroke={color}
              strokeWidth={2}
              name="annotation"
            />
            <KonvaText
              text={labels.find(label => label.id === annotation.label_id)?.name || 'object'}
              x={x}
              y={y - 20}
              fontSize={14}
              fill={color}
              fontStyle="bold"
              name="annotation"
            />
          </Group>
        </React.Fragment>
      );
    }

    if (project.type === 'instance_segmentation') {
      const points = annotation.data;
      if (!points || points.length < 3) return null;

      const polygonPoints = points.flat();
      return (
        <React.Fragment key={annotation.id}>
          <Group>
            <Line
              points={polygonPoints}
              stroke={color}
              strokeWidth={2}
              closed
            />
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

    if (project.type === 'contrastive_learning') {
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

  const renderDrawingPreview = () => {
    if (!drawingPoints || drawingPoints.length === 0) return null;

    if (drawingPoints.length === 2 && projectType === 'object_detection') {
      return (
        <Rect
          x={Math.min(drawingPoints[0].x, drawingPoints[1].x)}
          y={Math.min(drawingPoints[0].y, drawingPoints[1].y)}
          width={Math.abs(drawingPoints[1].x - drawingPoints[0].x)}
          height={Math.abs(drawingPoints[1].y - drawingPoints[0].y)}
          stroke="#00d4ff"
          strokeWidth={2}
          dash={[5, 5]}
        />
      );
    }

    if (drawingPoints.length >= 3 && projectType === 'instance_segmentation') {
      const polygonPoints = drawingPoints.flatMap(p => [p.x, p.y]);
      return (
        <Group>
          <Line
            points={polygonPoints}
            stroke="#7c3aed"
            strokeWidth={2}
            closed
          />
        </Group>
      );
    }

    if (drawingPoints.length > 0 && projectType === 'contrastive_learning') {
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      return (
        <React.Fragment>
          <Rect
            x={lastPoint.x - 5}
            y={lastPoint.y - 5}
            width={10}
            height={10}
            fill="#00d4ff"
          />
          <KonvaText
            text={`+C${contrastiveCount + 1}`}
            x={lastPoint.x + 8}
            y={lastPoint.y - 5}
            fontSize={12}
            fill="#00d4ff"
          />
        </React.Fragment>
      );
    }

    return null;
  };

  if (!selectedImage) {
    return (
      <div className="canvas-container">
        <div className="empty-state">
          <div className="empty-state-title">Select an image</div>
          <div className="empty-state-desc">
            Choose an image from the sidebar to start annotating
          </div>
        </div>
      </div>
    );
  }

  return (
    <Stage
      width={containerRef.current?.offsetWidth || 800}
      height={containerRef.current?.offsetHeight || 600}
      scaleX={scale}
      scaleY={scale}
      x={offset.x}
      y={offset.y}
      onMouseDown={onStageMouseDown}
      onMouseMove={onStageMouseMove}
      onMouseUp={onStageMouseUp}
      ref={stageRef}
    >
      <Layer>
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
        {annotations.map(renderAnnotation)}
        {renderDrawingPreview()}
      </Layer>
      <Layer>
        {selectedAnnotationId && (
          <Transformer
            ref={transformerRef}
            anchorSize={8}
            keepRatio={false}
            anchorCornerRadius={4}
            anchorStroke="#00d4ff"
            anchorFill="#ffffff"
            stroke="#00d4ff"
            strokeWidth={2}
            rotateEnabled={false}
            padding={0}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize to not go negative
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            onTransformEnd={handleTransformEnd}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;
