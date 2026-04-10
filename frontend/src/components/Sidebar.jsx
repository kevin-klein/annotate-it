import React, { useState } from 'react';
import useSWR from 'swr';
import UploadModal from './UploadModal';
import { fetcher } from '../services/api';

const Sidebar = ({ activeView, selectedProjectId, selectedImage, onSelectImage }) => {
  const [uploading, setUploading] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch images for the selected project
  const { data: imagesData, mutate: mutateImages } = useSWR(
    selectedProjectId ? `/api/images?project_id=${selectedProjectId}` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  // Fetch stats
  // const { data: stats } = useSWR(
  //   selectedProjectId ? `/api/images/stats?projectId=${selectedProjectId}` : null,
  //   fetcher
  // );
  const stats = null

  const images = imagesData || [];

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image[image]', file);
    formData.append('image[project_id]', selectedProjectId);

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        mutateImages();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
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
          </div>
        </>
      )}

      {activeView === 'annotation' && (
        <>
          <div className="sidebar-header">
            <h3>Images</h3>
          </div>
          <div className="sidebar-content">
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
          </div>
        </>
      )}

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </aside>
  );
};

export default Sidebar;
