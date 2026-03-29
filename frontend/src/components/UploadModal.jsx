import React, { useRef, useState } from 'react';

const UploadModal = ({ isOpen, onClose, onUpload, uploading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
      onClose();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      onClose();
    }
    e.target.value = '';
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
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          <div className="upload-icon">📁</div>
          <div className="upload-text">
            <div className="upload-title">Click to upload or drag and drop</div>
            <div className="upload-subtitle">PNG, JPG, GIF up to 10MB</div>
          </div>
        </div>

        <div className="upload-footer">
          <button className="modal-cancel" onClick={onClose}>
            {uploading ? 'Uploading...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
