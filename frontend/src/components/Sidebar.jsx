import React, { useState } from 'react';
import useSWR from 'swr';
import UploadModal from './UploadModal';
import { authenticatedApi as api } from '../services/auth';

const Sidebar = ({ activeView, selectedProjectId, selectedImage, onSelectImage, saveStatus, isSaving }) => {
  const [uploading, setUploading] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Fetch images for the selected project
  const { data: imagesData, mutate: mutateImages } = useSWR(
    selectedProjectId ? `/api/images?project_id=${selectedProjectId}` : null,
    api.fetcher,
    { dedupingInterval: 5000 }
  );

  // Fetch stats
  // const { data: stats } = useSWR(
  //   selectedProjectId ? `/api/images/stats?projectId=${selectedProjectId}` : null,
  //   fetcher
  // );
  const stats = null

  const images = imagesData || [];

  const handleUpload = (file, onProgress, onError) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image[image]', file);
    formData.append('image[project_id]', selectedProjectId);

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const data = await xhr.response ? JSON.parse(xhr.response) : {};
          if (data.success || data.image) {
            mutateImages();
            if (onProgress) onProgress(100);
          }
        } catch (error) {
          const errorMessage = 'Upload completed but response was invalid';
          if (onError) onError(errorMessage);
          setUploadError(errorMessage);
        }
      } else {
        try {
          const errorData = await xhr.response ? JSON.parse(xhr.response) : {};
          const errorMessage = errorData.error || errorData.message || 'Upload failed';
          if (onError) onError(errorMessage);
          setUploadError(errorMessage);
        } catch {
          const errorMessage = 'Upload failed. Please try again.';
          if (onError) onError(errorMessage);
          setUploadError(errorMessage);
        }
      }
      setUploading(false);
    });

    xhr.addEventListener('error', () => {
      const errorMessage = 'Network error occurred during upload';
      if (onError) onError(errorMessage);
      setUploadError(errorMessage);
      setUploading(false);
    });

    xhr.addEventListener('abort', () => {
      setUploading(false);
    });

    xhr.open('POST', '/api/images');
    xhr.send(formData);
  };

  return (
    <aside className="sidebar">
      {activeView === 'images' && (
        <>
          <div className="sidebar-header">
            <h3>Images</h3>
          </div>
          <div className="sidebar-content">
            {/* Upload Section */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                className="upload-btn"
                onClick={() => setShowUploadModal(true)}
              >
                + Add Images
              </button>
            </div>

            {/* Statistics */}
            {stats && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="sidebar-item-meta" style={{ marginBottom: '0.5rem' }}>
                  <span>Statistics</span>
                </div>
                <div className="grid-stats">
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.total_images || 0}</div>
                    <div className="stat-card-label">Images</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.object_detection_count || 0}</div>
                    <div className="stat-card-label">Objects</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.segmentation_count || 0}</div>
                    <div className="stat-card-label">Segments</div>
                  </div>
                </div>
              </div>
            )}

            {/* Image List */}
            {images && images.length > 0 && (
              <div className="annotation-list" style={{maxHeight: 800}}>
                {images.map(image => (
                  <div
                    key={image.id}
                    className={`sidebar-item ${selectedImage?.id === image.id ? 'active' : ''}`}
                    onClick={() => onSelectImage(image)}
                  >
                    <div className="sidebar-item-header">
                      <div className="sidebar-item-title">{image.original_name}</div>
                    </div>
                    <div className="sidebar-item-meta">
                      <span>{image.id}</span>
                      <span>{image.width}x{image.height}</span>
                      <span>{image.created_at.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!images || images.length === 0) && (
              <div className="empty-state">
                <div className="empty-state-icon">📷</div>
                <div className="empty-state-title">No images yet</div>
                <div className="empty-state-desc">Add images to start annotating</div>
              </div>
            )}

            {/* Save progress overlay */}
            {isSaving && (
              <div className="sidebar-save-overlay">
                <div className="saving-spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
                <span>Saving annotations...</span>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'annotation' && (
        <>
          <div className="sidebar-header">
            <h3>Images</h3>
            {saveStatus && (
              <div className={`save-status ${saveStatus}`}>
                {saveStatus === 'saving' && <div className="saving-spinner" />}
                <span className="save-status-text">
                  {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
                </span>
              </div>
            )}
          </div>
          <div className="sidebar-content" style={{ pointerEvents: isSaving ? 'none' : 'auto' }}>
            {/* Quick Upload */}
            <button
              className="upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              + Add Image
            </button>

            {/* Statistics */}
            {stats && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="sidebar-item-meta" style={{ marginBottom: '0.5rem' }}>
                  <span>Statistics</span>
                </div>
                <div className="grid-stats">
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.total_images || 0}</div>
                    <div className="stat-card-label">Images</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.object_detection_count || 0}</div>
                    <div className="stat-card-label">Objects</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{stats.segmentation_count || 0}</div>
                    <div className="stat-card-label">Segments</div>
                  </div>
                </div>
              </div>
            )}

            {/* Image List */}
            {images && images.length > 0 && (
              <div className="annotation-list">
                {images.map(image => (
                  <div
                    key={image.id}
                    className={`sidebar-item ${selectedImage?.id === image.id ? 'active' : ''}`}
                    onClick={() => onSelectImage(image)}
                  >
                    <div className="sidebar-item-header">
                      <div className="sidebar-item-title">{image.original_name}</div>
                    </div>
                    <div className="sidebar-item-meta">
                      <span>{image.width}x{image.height}</span>
                      <span>{image.created_at.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!images || images.length === 0) && (
              <div className="empty-state">
                <div className="empty-state-icon">📷</div>
                <div className="empty-state-title">No images yet</div>
                <div className="empty-state-desc">Add images to start annotating</div>
              </div>
            )}

            {/* Save progress overlay */}
            {isSaving && (
              <div className="sidebar-save-overlay">
                <div className="saving-spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
                <span>Saving annotations...</span>
              </div>
            )}
          </div>
        </>
      )}

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadError(null);
          setUploadProgress(0);
        }}
        onUpload={handleUpload}
        uploading={uploading}
        setUploadProgress={setUploadProgress}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
      />
    </aside>
  );
};

export default Sidebar;
