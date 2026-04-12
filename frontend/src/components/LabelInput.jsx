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
    <div className="label-input">
      <label htmlFor="label-select">Label:</label>
      <select
        id="label-select"
        value={label}
        onChange={handleLabelChange}
      >
        {labels.map(label => <option value={label.name} key={label.id}>{label.name}</option>)}
      </select>
    </div>
  );
};

export default LabelInput;
