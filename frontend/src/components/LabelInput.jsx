import React from 'react';

const LabelInput = ({ label, labels, onLabelChange}) => {

  React.useEffect(() => {
    if(label === '') {
      onLabelChange(labels[0].name)
    }
  }, [labels])

  const handleLabelChange = (e) => {
    onLabelChange(e.target.value);
  };

  return (
    <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
      <select
        placeholder="Label..."
        style={{
            padding: '0.5rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            borderRadius: '4px',
          }}
        value={label}
        onChange={handleLabelChange}
      >
        {labels.map(label => <option value={label.name} key={label.id}>{label.name}</option>)}
      </select>
    </div>
  );
};

export default LabelInput;
