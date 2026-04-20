import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabelInput from '../LabelInput';

describe('LabelInput', () => {
  const mockLabels = [
    { id: 1, name: 'Label 1' },
    { id: 2, name: 'Label 2' },
  ];
  const mockOnLabelChange = jest.fn();
  const mockLabel = mockLabels[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the label select with options', () => {
    render(
      <LabelInput 
        label={mockLabel} 
        labels={mockLabels} 
        onLabelChange={mockOnLabelChange} 
      />
    );

    expect(screen.getByLabelText(/Label:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Label 1')).toBeInTheDocument();
    expect(screen.getByText('Label 2')).toBeInTheDocument();
  });

  test('calls onLabelChange when a new label is selected', () => {
    render(
      <LabelInput 
        label={mockLabel} 
        labels={mockLabels} 
        onLabelChange={mockOnLabelChange} 
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Label 2' } });

    expect(mockOnLabelChange).toHaveBeenCalledWith(mockLabels[1]);
  });
});
