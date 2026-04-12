import React from 'react';

const LabelInput = ({ label, labels, onLabelChange}) => {

  React.useEffect(() => {
    if(label.id === undefined) {
      onLabelChange(labels[0])
    }
  }, [labels])

  const handleLabelChange = (e) => {
    onLabelChange(labels.find(label => label.name === e.target.value));
  };

  return (
    <div className="label-input">
      <label htmlFor="label-select">Label:</label>
      <select
        id="label-select"
        value={label.name}
        onChange={handleLabelChange}
      >
        {labels.map(label => <option value={label.name} key={label.id}>{label.name}</option>)}
      </select>
    </div>
  );
};

export default LabelInput;
