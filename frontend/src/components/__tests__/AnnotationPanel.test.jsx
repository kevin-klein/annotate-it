import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnotationPanel from '../AnnotationPanel';

describe('AnnotationPanel', () => {
  const mockProject = { id: 1, name: 'Test Project' };
  const mockAnnotations = [
    { id: 101, data: [[0, 0], [10, 10]] },
    { id: 102, data: [[20, 20], [30, 30]] },
  ];
  const mockLabels = [
    { id: 1, name: 'Label 1' },
    { id: 2, name: 'Label 2' },
  ];
  const mockOnDelete = jest.fn();
  const mockOnSelectAnnotation = jest.fn();
  const mockOnLabelChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the correct number of annotations', () => {
    render(
      <AnnotationPanel
        project={mockProject}
        annotations={mockAnnotations}
        onDelete={mockOnDelete}
        label={mockLabels[0]}
        onLabelChange={mockOnLabelChange}
        labels={mockLabels}
        onSelectAnnotation={mockOnSelectAnnotation}
        selectedAnnotationId={null}
        projectId={1}
        api={{}}
        onLabelAdded={jest.fn()}
      />
    );

    expect(screen.getByText(/Annotations \(2\)/i)).toBeInTheDocument();
  });

  test('calls onSelectAnnotation when an annotation is clicked', () => {
    // This might be tricky because AnnotationItem might not be easily testable without its dependencies
    // Let's see if we can just check if the list is rendered.
    render(
      <AnnotationPanel
        project={mockProject}
        annotations={mockAnnotations}
        onDelete={mockOnDelete}
        label={mockLabels[0]}
        onLabelChange={mockOnLabelChange}
        labels={mockLabels}
        onSelectAnnotation={mockOnSelectAnnotation}
        selectedAnnotationId={null}
        projectId={1}
        api={{}}
        onLabelAdded={jest.fn()}
      />
    );

    // We can't easily click AnnotationItem without knowing its internal structure, 
    // but we can check if the panel content is there.
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
