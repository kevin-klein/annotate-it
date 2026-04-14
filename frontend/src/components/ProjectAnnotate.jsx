import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import useSWR from 'swr';
import { authenticatedApi as api } from '../services/auth';
import Header from './Header';
import Canvas from './Canvas';

const ProjectAnnotate = ({ onBackToProjects }) => {
  const [_, navigate] = useLocation();
  const { id: projectId } = useParams();
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [projectData, setProjectData] = useState(null);

  // Fetch project data
  const { data: projectResponse } = useSWR(
    projectId ? `/api/projects/${projectId}` : null,
    api.fetcher
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
    { dedupingInterval: 5000 }
  );

  // Fetch annotations for the selected image
  const selectedImage = imagesData?.images?.find(img => img.id === selectedImageId);
  const { data: annotationsData, mutate: mutateAnnotations } = useSWR(
    selectedImageId ? `/api/annotations?imageId=${selectedImageId}&type=object_detection` : null,
    api.fetcher
  );

  const images = imagesData?.images || [];
  const annotations = annotationsData?.annotations || [];

  const handleImageClick = useCallback((image) => {
    setSelectedImageId(image.id);
    navigate(`/project/${projectId}/annotate`);
  }, [projectId, navigate]);

  const handleBackToImages = useCallback(() => {
    setSelectedImageId(null);
    navigate(`/project/${projectId}/images`);
  }, [projectId, navigate]);

  const handleAnnotationSave = useCallback(() => {
    mutateAnnotations();
  }, [mutateAnnotations]);

  const handleAnnotationUpdate = useCallback(() => {
    mutateAnnotations();
  }, [mutateAnnotations]);

  const handleAnnotationDelete = useCallback(() => {
    mutateAnnotations();
  }, [mutateAnnotations]);

  return (
    <>
      <Header
        activeView="annotate"
        selectedProjectId={projectId}
        onBackToProjects={handleBackToImages}
      />
      <div className="main-content">
        {/* Image list sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <button className="btn-back" onClick={handleBackToImages}>
              ←
            </button>
            <h3>Images</h3>
          </div>
          <div className="sidebar-content">
            {images.length > 0 ? (
              <div className="image-list">
                {images.map(image => (
                  <div
                    key={image.id}
                    className={`image-list-item ${selectedImageId === image.id ? 'active' : ''}`}
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="image-thumbnail">
                      {image.thumbnail ? (
                        <img src={image.thumbnail} alt="" />
                      ) : (
                        <div className="thumbnail-placeholder">🖼️</div>
                      )}
                    </div>
                    <div className="image-info">
                      <div className="image-name">{image.original_name}</div>
                      <div className="image-stats">
                        {annotations.filter(a => a.image_id === image.id).length} annotations
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📷</div>
                <div className="empty-state-title">No images yet</div>
                <div className="empty-state-desc">Add images to start annotating</div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas area */}
        <div className="canvas-area">
          {selectedImage ? (
            <Canvas
              selectedImage={selectedImage}
              selectedProjectId={projectId}
              activeAnnotationType={projectData?.type}
              onTypeChange={() => {}}
              projectLabels={projectData?.labels || []}
              annotations={annotations}
              onAnnotationsSaved={handleAnnotationSave}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📷</div>
              <div className="empty-state-title">Select an image</div>
              <div className="empty-state-desc">Choose an image from the list to start annotating</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectAnnotate;
