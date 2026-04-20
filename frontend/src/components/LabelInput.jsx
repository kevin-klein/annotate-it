import React, { useState } from 'react';
import NewLabelModal from './NewLabelModal';

const LabelInput = ({ label, labels, onLabelChange, projectId, api, onLabelAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if(label.id === undefined && labels.length > 0) {
      onLabelChange(labels[0])
    }
  }, [labels, onLabelChange])

  const handleLabelChange = (e) => {
    const selectedLabel = labels.find(l => l.name === e.target.value);
    if (selectedLabel) {
      onLabelChange(selectedLabel);
    }
  };

  const handleNewLabelClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="label-input">
      <label htmlFor="label-select">Label:</label>
      <div className="label-select-container" style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
        <select
          id="label-select"
          value={label.name}
          onChange={handleLabelChange}
          style={{ flex: 1 }}
        >
          {labels.map(l => <option value={l.name} key={l.id}>{l.name}</option>)}
        </select>
        <button
          className="btn-add"
          onClick={handleNewLabelClick}
          title="Create new label"
          style={{ padding: '0 0.5rem' }}
        >
          +
        </button>
      </div>

      <NewLabelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onLabelAdded}
        projectId={projectId}
        api={api}
      />
    </div>
  );
};

export default LabelInput;
