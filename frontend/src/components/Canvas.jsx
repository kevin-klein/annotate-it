import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { v4 as uuidv4 } from "uuid";
import { authenticatedApi as api, authService } from "../services/auth";
import AnnotationPanel from "./AnnotationPanel";
import DrawingCanvas from "./DrawingCanvas";
import LabelInput from "./LabelInput";

// Helper functions extracted to reduce cognitive complexity
const createScaledPosition = (e, offset, scale) => {
	const stage = e.target.getStage();
	const pos = stage.getPointerPosition();
	return {
		x: (pos.x - offset.x) / scale,
		y: (pos.y - offset.y) / scale,
	};
};

const createObjectDetectionAnnotation = (
	drawingPoints,
	labelId,
	selectedImageId,
) => {
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

	return {
		id: uuidv4(),
		data: points,
		label_id: labelId,
		image_id: selectedImageId,
	};
};

const createInstanceSegmentationAnnotation = (
	drawingPoints,
	prevAnnotations,
) => {
	const newAnnotations = [...prevAnnotations];
	if (newAnnotations.length > 0) {
		newAnnotations[newAnnotations.length - 1] = {
			...newAnnotations[newAnnotations.length - 1],
			data: drawingPoints.map((p) => [p.x, p.y]),
		};
	}
	return newAnnotations;
};

const createContrastiveLearningAnnotation = (
	drawingPoints,
	selectedImageId,
	projectType,
) => {
	const lastPoint = drawingPoints[drawingPoints.length - 1];
	return {
		id: uuidv4(),
		image_id: selectedImageId,
		type: projectType,
		label: "contrastive_point",
		data: null,
		metadata: {
			contrastivePoints: [lastPoint],
		},
	};
};

const Canvas = ({
	selectedImage,
	selectedProjectId,
	activeAnnotationType,
	onTypeChange,
	onAnnotationsSaved,
	onSaveStatusChange,
	saveFnRef,
	mutateImages,
}) => {
	const [exporting, setExporting] = useState(false);
	const [projectData, setProjectData] = useState(null);
	const [projectType, setProjectType] = useState(null);
	const saveTimeoutRef = useRef(null);
	const [annotationsVersion, setAnnotationsVersion] = useState(0);

	const { data: project, isLoading: isProjectLoading } = useSWR(
		selectedProjectId ? `/api/projects/${selectedProjectId}` : null,
		api.fetcher,
	);

	const {
		data: labels,
		isLoading: isLabelsLoading,
		error: labelsError,
		mutate: mutateLabels,
	} = useSWR(
		selectedProjectId ? `/api/labels?projectId=${selectedProjectId}` : null,
		api.fetcher,
	);

	const {
		data: existingAnnotations,
		isLoading: isAnnotationsLoading,
		error: annotationsError,
	} = useSWR(
		selectedProjectId ? `/api/annotations?image_id=${selectedImage.id}` : null,
		api.fetcher,
	);

	const [label, setLabel] = useState({});
	const [tool, setTool] = useState("hand");
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
	const [annotations, setAnnotations] = useState([]);
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [drawingPoints, setDrawingPoints] = useState([]);
	const stageRef = useRef(null);
	const canvasAreaRef = useRef(null);
	const [imageObj, setImageObj] = useState(null);
	const [imageFinished, setImageFinished] = useState(false);

	// Sync imageFinished when selectedImage changes
	useEffect(() => {
		if (selectedImage?.id) {
			setImageFinished(selectedImage.finished || false);
		}
	}, [selectedImage]);

	// Load project data and sync annotation type
	useEffect(() => {
		if (project) {
			setProjectData(project);
			setProjectType(project.annotation_type);
			if (
				project.annotation_type &&
				activeAnnotationType !== project.annotation_type
			) {
				onTypeChange(project.annotation_type);
			}
		}
	}, [project, activeAnnotationType, onTypeChange]);

	// Load existing annotations
	React.useEffect(() => {
		if (existingAnnotations) {
			setAnnotations(existingAnnotations);
		}
	}, [existingAnnotations]);

	// Expose save function to parent via ref
	useEffect(() => {
		if (saveFnRef) {
			saveFnRef.current = handleSaveAllAnnotations;
		}
	}, [saveFnRef]);

	// Debounced auto-save when annotations change
	useEffect(() => {
		if (annotations.length === 0) return;

		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		onSaveStatusChange("unsaved");

		saveTimeoutRef.current = setTimeout(async () => {
			await handleSaveAllAnnotations();
		}, 1500);

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [annotationsVersion]);

	// Load image
	useEffect(() => {
		if (selectedImage?.file_path) {
			const img = new window.Image();
			img.src = selectedImage.file_path;
			img.onload = () => setImageObj(img);
			img.onerror = () => {
				console.error("Failed to load image:", selectedImage.file_path);
			};
		} else if (selectedImage?.id) {
			fetch(`/api/images/${selectedImage.id}`, {
				headers: authService.getAuthHeader(),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.image?.url) {
						const img = new window.Image();
						img.src = data.image.url;
						img.onload = () => setImageObj(img);
						img.onerror = () => {
							console.error("Failed to load image:", data.image.url);
						};
					}
				})
				.catch((err) => console.error("Error fetching image:", err));
		}
	}, [selectedImage]);

	// Auto-scale image to fit canvas
	useEffect(() => {
		if (canvasAreaRef.current && selectedImage) {
			const { width, height } = canvasAreaRef.current.getBoundingClientRect();
			const scaleX = width / selectedImage.width;
			const scaleY = height / selectedImage.height;
			const newScale = Math.min(scaleX, scaleY) * 0.95;
			setScale(newScale);
			setOffset({
				x: (width - selectedImage.width * newScale) / 2,
				y: (height - selectedImage.height * newScale) / 2,
			});
		}
	}, [selectedImage, canvasAreaRef.current]);

	// Handle stage mouse down
	const handleStageMouseDown = (e) => {
		if (e.evt.button !== 0) return;

		if (tool === "hand") {
			setIsPanning(true);
			setPanStart({ x: e.evt.clientX, y: e.evt.clientY });
			return;
		}

		if (tool !== "add" || !selectedImage) return;

		if (projectType === "object_detection") {
			const scaledPos = createScaledPosition(e, offset, scale);
			setDrawingPoints([scaledPos]);
			setIsDrawing(true);
		} else {
			const scaledPos = createScaledPosition(e, offset, scale);
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
			setAnnotations((prev) => [...prev, newAnnotation]);
			setAnnotationsVersion((v) => v + 1);
		}
	};

	// Handle stage mouse move
	const handleStageMouseMove = (e) => {
		if (!selectedImage) return;

		if (isPanning) {
			const dx = e.evt.clientX - panStart.x;
			const dy = e.evt.clientY - panStart.y;
			setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
			setPanStart({ x: e.evt.clientX, y: e.evt.clientY });
			return;
		}

		if (!isDrawing || tool !== "add") return;

		const scaledPos = createScaledPosition(e, offset, scale);
		setDrawingPoints([drawingPoints[0], scaledPos]);
	};

	// Handle stage mouse up - create annotation based on project type
	const handleStageMouseUp = () => {
		setIsPanning(false);
		setIsDrawing(false);

		if (tool !== "add") {
			setDrawingPoints([]);
			return;
		}

		try {
			let newAnnotations = [...annotations];

			if (projectType === "object_detection" && drawingPoints.length === 2) {
				newAnnotations.push(
					createObjectDetectionAnnotation(
						drawingPoints,
						label.id,
						selectedImage.id,
					),
				);
			} else if (
				projectType === "instance_segmentation" &&
				drawingPoints.length >= 3
			) {
				newAnnotations = createInstanceSegmentationAnnotation(
					drawingPoints,
					newAnnotations,
				);
			} else if (projectType === "contrastive_learning") {
				newAnnotations.push(
					createContrastiveLearningAnnotation(
						drawingPoints,
						selectedImage.id,
						projectType,
					),
				);
			}

			console.log(newAnnotations)

			setAnnotations(newAnnotations);
			setAnnotationsVersion((v) => v + 1);
		} catch (error) {
			console.error("Error creating annotation:", error);
		}

		setDrawingPoints([]);
	};

	const handleSaveAllAnnotations = async () => {
		if (annotations.length === 0) {
			if (onSaveStatusChange) onSaveStatusChange("saved");
			return;
		}

		if (onSaveStatusChange) {
			onSaveStatusChange("saving");
		}

		try {
			const responses = await Promise.all(
				annotations.map((annotation) => {
					const { id, data, label_id, image_id } = annotation;

					return fetch("/api/annotations", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
							...authService.getAuthHeader(),
						},
						body: JSON.stringify({
							annotation: { id, label_id, data, image_id },
						}),
					});
				}),
			);

			// Check for non-ok responses
			const failedResponses = responses.filter((res) => !res.ok);
			if (failedResponses.length > 0) {
				throw new Error(`${failedResponses.length} annotation(s) failed to save`);
			}

			if (onSaveStatusChange) {
				onSaveStatusChange("saved");
			}
		} catch (error) {
			console.error("Error saving annotations:", error);
			if (onSaveStatusChange) {
				onSaveStatusChange("unsaved");
			}
		}
	};

	const handleUpdateAnnotation = (updatedAnnotation) => {
		setAnnotations((prev) =>
			prev.map((a) =>
				a.id === updatedAnnotation.id ? { ...a, ...updatedAnnotation } : a,
			),
		);
		setAnnotationsVersion((v) => v + 1);
	};

	const handleDeleteAnnotation = async (id) => {
		setAnnotations((prev) => prev.filter((a) => a.id !== id));
		try {
			if (typeof id === "number") {
				const response = await fetch(`/api/annotations/${id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						...authService.getAuthHeader(),
					},
				});
				if (!response.ok) {
					throw new Error("Failed to delete annotation");
				}
			}
		} catch (error) {
			console.error("Failed to delete annotation:", error);
		}

		setAnnotationsVersion((v) => v + 1);
		setSelectedAnnotationId(null);
	};

	const handleAnnotationSelect = (id) => {
		setSelectedAnnotationId(id);
	};

	const handleZoomIn = () => {
		console.log('zoom in')
		setScale(s => Math.min(s * 1.2, 3));
	}
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

	const toggleDone = async () => {
		if (!selectedImage) return;
		const newFinished = !imageFinished;
		setImageFinished(newFinished);
		try {
			await fetch(`/api/images/${selectedImage.id}/finish`, {
				method: 'POST',
				headers: authService.getAuthHeader(),
			});
			if (mutateImages) {
				mutateImages();
			}
		} catch (error) {
			console.error('Error toggling done:', error);
			setImageFinished(!newFinished);
		}
	}

	const handleExport = async () => {
		setExporting(true);
		try {
			const response = await fetch(
				`/api/projects/${selectedProjectId}/export`,
				{
					method: "GET",
					headers: authService.getAuthHeader(),
				},
			);

			if (!response.ok) {
				throw new Error("Export failed");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `project_export_${Date.now()}.zip`;
			document.body.append(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Export error:", error);
			console.warn("Failed to export project. Please try again.");
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className="canvas-layout">
			<div className="canvas-area">
				<div
					ref={canvasAreaRef}
					onWheel={handleWheel}
					style={{ flex: 1, width: "100%", display: "flex" }}
				>
					<DrawingCanvas
						project={project}
						imageObj={imageObj}
						selectedImage={selectedImage}
						scale={scale}
						offset={offset}
						labels={labels || []}
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
						containerRef={canvasAreaRef}
					/>
				</div>
			</div>

			<AnnotationPanel
				project={project}
				label={label || {}}
				labels={labels || []}
				onLabelChange={setLabel}
				annotations={annotations}
				onDelete={handleDeleteAnnotation}
				onSelectAnnotation={handleAnnotationSelect}
				selectedAnnotationId={selectedAnnotationId}
				projectId={selectedProjectId}
				api={api}
				onLabelAdded={mutateLabels}
				toggleDone={toggleDone}
				finished={imageFinished}
				scale={scale}
				handleZoomIn={handleZoomIn}
				handleZoomOut={handleZoomOut}
				projectType={projectType}
				tool={tool}
				setTool={setTool}
				handleExport={handleExport}
			/>
		</div>
	);
};

export default Canvas;
