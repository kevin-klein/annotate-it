import React, { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useLocation, useParams } from "wouter";
import { authenticatedApi as api } from "../services/auth";
import Canvas from "./Canvas";
import Header from "./Header";
import Sidebar from "./Sidebar";

const ProjectView = ({ onBackToProjects }) => {
	const [_, navigate] = useLocation();
	const { id: projectId } = useParams();
	const [selectedImageId, setSelectedImageId] = useState(null);
	const [projectData, setProjectData] = useState(null);
	const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'unsaved'
	const [isSaving, setIsSaving] = useState(false);
	const [pendingImageId, setPendingImageId] = useState(null);
	const saveFnRef = useRef(null);

	// Fetch project data
	const { data: projectResponse } = useSWR(
		projectId ? `/api/projects/${projectId}` : null,
		api.fetcher,
	);

	useEffect(() => {
		if (projectResponse?.project) {
			setProjectData(projectResponse.project);
		}
	}, [projectResponse]);

	// Fetch images for the project
	const { data: imagesData, mutate: mutateImages } = useSWR(
		projectId ? `/api/images?project_id=${projectId}` : null,
		api.fetcher,
		{ dedupingInterval: 5000 },
	);

	// Fetch annotations for the selected image
	const selectedImage = imagesData?.find((img) => img.id === selectedImageId);
	const { data: annotationsData, mutate: mutateAnnotations } = useSWR(
		selectedImageId
			? `/api/annotations?imageId=${selectedImageId}&type=object_detection`
			: null,
		api.fetcher,
	);

	const annotations = annotationsData?.annotations || [];

	const performImageSelect = useCallback(
		(image) => {
			setSelectedImageId(image.id);
			navigate(`/project/${projectId}/annotate`);
			setPendingImageId(null);
		},
		[projectId, navigate],
	);

	const handleImageSelect = useCallback(
		(image) => {
			if (saveStatus === "unsaved" && saveFnRef.current) {
				// Save first, then select
				setIsSaving(true);
				setPendingImageId(image.id);
				saveFnRef
					.current()
					.then(() => {
						setIsSaving(false);
						// After save completes, performImageSelect will be called from the effect below
					})
					.catch(() => {
						setIsSaving(false);
						setPendingImageId(null);
					});
			} else {
				performImageSelect(image);
			}
		},
		[saveStatus, performImageSelect],
	);

	// When pending image is set and save completes (saveStatus changes to 'saved'), select it
	useEffect(() => {
		if (saveStatus === "saved" && pendingImageId) {
			const image = imagesData?.find((img) => img.id === pendingImageId);
			if (image) {
				performImageSelect(image);
			}
		}
	}, [saveStatus, pendingImageId, imagesData, performImageSelect]);

	const handleBackToImages = useCallback(() => {
		setSelectedImageId(null);
		navigate(`/project/${projectId}/images`);
	}, [projectId, navigate]);

	const handleAnnotationSave = useCallback(() => {
		mutateAnnotations();
	}, [mutateAnnotations]);

	const handleSaveStatusChange = useCallback((status) => {
		setSaveStatus(status);
	}, []);

	return (
		<>
			<Header
				activeView="annotation"
				selectedProjectId={projectId}
				onBackToProjects={handleBackToImages}
			/>
			<div className="main-content">
				<Sidebar
					activeView="annotation"
					saveStatus={saveStatus}
					isSaving={isSaving}
					selectedProjectId={projectId}
					selectedImage={selectedImage}
					onSelectImage={handleImageSelect}
				/>
				{selectedImage ? (
					<Canvas
						selectedImage={selectedImage}
						selectedProjectId={projectId}
						activeAnnotationType={projectData?.type}
						onTypeChange={() => {}}
						projectLabels={projectData?.labels || []}
						annotations={annotations}
						onAnnotationsSaved={handleAnnotationSave}
						onSaveStatusChange={handleSaveStatusChange}
						saveFnRef={saveFnRef}
					/>
				) : (
					<div className="main-content-empty">
						<div className="empty-state">
							<div className="empty-state-icon">📷</div>
							<div className="empty-state-title">Select an image</div>
							<div className="empty-state-desc">
								Choose an image from the list to start annotating
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ProjectView;
