import React, { useRef, useState } from 'react';

const UploadModal = ({ isOpen, setUploadProgress, onClose, onUpload, uploading = false, uploadProgress = 0, uploadError: propError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const fileInputRef = useRef(null);

  const uploadError = propError || internalError;

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setInternalError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = '';
  };

  const handleUpload = (file) => {
    setInternalError(null);
    onUpload(file, setUploadProgress, setInternalError);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h3>Upload Images</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.zip"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          <div className="upload-icon">📁</div>
          <div className="upload-text">
            <div className="upload-title">Click to upload or drag and drop</div>
            <div className="upload-subtitle">PNG, JPG, GIF, ZIP up to 10MB</div>
          </div>
        </div>

        <div className="upload-progress-container">
          {uploading && (
            <>
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="upload-progress-text">
                {uploadProgress < 100 ? `${uploadProgress}%` : 'Complete!'}
              </div>
            </>
          )}
          {uploadError && (
            <div className="upload-error">
              <span className="error-icon">⚠️</span>
              <span>{uploadError}</span>
              <button
                className="error-retry-btn"
                onClick={() => {
                  setInternalError(null);
                  // Reset the file input so the same file can be selected again
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="upload-footer">
          <button className="modal-cancel" onClick={onClose} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
