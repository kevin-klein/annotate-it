import React, { useState } from 'react';

const NewLabelModal = ({ isOpen, onClose, onSave, projectId, api }) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmedName = newLabelName.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    setError(null);

    try {
      await api.post('/api/labels', {
        project_id: projectId,
        name: trimmedName
      });
      setNewLabelName('');
      onSave();
      onClose();
    } catch (err) {
      console.error('Error creating label:', err);
      setError(err.message || 'Failed to create label');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewLabelName('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h3>New Label</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="upload-drop-zone" style={{ minHeight: 'auto', padding: '2rem', flexDirection: 'column' }}>
          <div className="settings-section" style={{ width: '100%' }}>
            <label htmlFor="new-label-name" style={{ display: 'block', marginBottom: '0.5rem' }}>Label Name</label>
            <input
              id="new-label-name"
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter label name..."
              autoFocus
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {error && <p className="error" style={{ marginTop: '1rem' }}>{error}</p>}
          </div>
        </div>

        <div className="upload-footer">
          <button className="modal-cancel" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </button>
          <button
            className="btn-create-new"
            onClick={handleSave}
            disabled={!newLabelName.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Create Label'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLabelModal;
