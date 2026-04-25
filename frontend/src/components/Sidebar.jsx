import React, { useState } from 'react';
import useSWR from 'swr';
import UploadModal from './UploadModal';
import { authenticatedApi as api, authService } from '../services/auth';

const ImageList = ({ images, selectedImage, onSelectImage, filter }) => {
  const filteredImages = images.filter((image) => {
    if (filter === 'finished') return image.finished;
    if (filter === 'not_finished') return !image.finished;
    return true;
  });

  if (!filteredImages || filteredImages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📷</div>
        <div className="empty-state-title">No images yet</div>
        <div className="empty-state-desc">Add images to start annotating</div>
      </div>
    );
  }

  return (
    <div className="annotation-list" style={{ maxHeight: 800 }}>
      {filteredImages.map(image => (
        <div
          key={image.id}
          className={`sidebar-item ${selectedImage?.id === image.id ? 'active' : ''}`}
          onClick={() => onSelectImage(image)}
        >
          <div className="sidebar-item-header">
            <div className="sidebar-item-title">{image.original_name}</div>
            {image.finished && (
              <span style={{ fontSize: '0.75rem' }}>✓</span>
            )}
          </div>
          <div className="sidebar-item-meta">
            <span>{image.width}x{image.height}</span>
            <span>{image.created_at.split('T')[0]}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const FilterBar = ({ filter, onFilterChange }) => {
  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'finished', label: 'Finished' },
    { key: 'not_finished', label: 'Not Finished' },
  ];

  return (
    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '4px', background: 'var(--bg-primary)', borderRadius: '6px', padding: '3px' }}>
      {filterButtons.map(btn => (
        <button
          key={btn.key}
          className="tool-btn"
          onClick={() => onFilterChange(btn.key)}
          style={{
            flex: 1,
            padding: '6px 8px',
            fontSize: '0.7rem',
            fontWeight: 500,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: filter === btn.key ? 'var(--accent-primary)' : 'transparent',
            color: filter === btn.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

const Sidebar = ({ activeView, selectedProjectId, selectedImage, onSelectImage, saveStatus, isSaving, mutateImages }) => {
  const [uploading, setUploading] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [imageFilter, setImageFilter] = useState('all');

  // Fetch images for the selected project
  const { data: imagesData, error: imagesError } = useSWR(
    selectedProjectId ? `/api/images?project_id=${selectedProjectId}` : null,
    api.fetcher,
    { dedupingInterval: 5000 }
  );

  const stats = null;
  const images = imagesData || [];

  const handleUpload = (file, onProgress, onError) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image[image]', file);
    formData.append('image[project_id]', selectedProjectId);

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
    xhr.setRequestHeader("Authorization", authService.getAuthHeader().Authorization)

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
              {imagesError && (
                <div className="upload-error" style={{ marginBottom: '0.5rem' }}>
                  <span>Failed to load images</span>
                  <button
                    className="error-retry-btn"
                    onClick={() => mutateImages()}
                    style={{ marginLeft: '0.5rem', fontSize: '0.8rem', padding: '2px 8px' }}
                  >
                    Retry
                  </button>
                </div>
              )}
              <button
                className="upload-btn"
                onClick={() => setShowUploadModal(true)}
              >
                + Add Images
              </button>
            </div>

            {/* Filter */}
            <FilterBar filter={imageFilter} onFilterChange={setImageFilter} />

            {/* Image List */}
            <ImageList
              images={images}
              selectedImage={selectedImage}
              onSelectImage={onSelectImage}
              filter={imageFilter}
            />

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
            {imagesError && (
              <div className="upload-error" style={{ marginBottom: '0.5rem' }}>
                <span>Failed to load images</span>
                <button
                  className="error-retry-btn"
                  onClick={() => mutateImages()}
                  style={{ marginLeft: '0.5rem', fontSize: '0.8rem', padding: '2px 8px' }}
                >
                  Retry
                </button>
              </div>
            )}
            <button
              className="upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              + Add Image
            </button>

            {/* Filter */}
            <FilterBar filter={imageFilter} onFilterChange={setImageFilter} />

            {/* Image List */}
            <ImageList
              images={images}
              selectedImage={selectedImage}
              onSelectImage={onSelectImage}
              filter={imageFilter}
            />

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
