import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnotationItem from '../AnnotationItem';

describe('AnnotationItem', () => {
  const mockProject = { annotation_type: 'object_detection' };
  const mockLabels = [
    { id: 1, name: 'Label 1' },
    { id: 2, name: 'Label 2' },
  ];
  const mockAnnotation = {
    id: 101,
    label_id: 1,
    data: [[10.5, 20.7]],
  };
  const mockOnDelete = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the correct label name', () => {
    render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('Label 1')).toBeInTheDocument();
  });

  test('renders "Untitled" if no label matches', () => {
    const unknownAnnotation = { ...mockAnnotation, label_id: 999 };
    render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={unknownAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  test('renders correct icon for object_detection', () => {
    render(
      <AnnotationItem
        project={{ ...mockProject, annotation_type: 'object_detection' }}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('🔲')).toBeInTheDocument();
  });

  test('renders correct icon for instance_segmentation', () => {
    render(
      <AnnotationItem
        project={{ ...mockProject, annotation_type: 'instance_segmentation' }}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('🟣')).toBeInTheDocument();
  });

  test('renders correct icon for contrastive_learning', () => {
    render(
      <AnnotationItem
        project={{ ...mockProject, annotation_type: 'contrastive_learning' }}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('🔵')).toBeInTheDocument();
  });

  test('renders default icon for unknown type', () => {
    render(
      <AnnotationItem
        project={{ ...mockProject, annotation_type: 'unknown' }}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('✏️')).toBeInTheDocument();
  });

  test('renders rounded coordinates for object_detection', () => {
    render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText(/x: 11, y: 21/i)).toBeInTheDocument();
  });

  test('renders point count for instance_segmentation', () => {
    const segmentationProject = { annotation_type: 'instance_segmentation' };
    const segmentationAnnotation = {
      ...mockAnnotation,
      data: [[0, 0], [1, 1], [2, 2]],
    };
    render(
      <AnnotationItem
        project={segmentationProject}
        labels={mockLabels}
        annotation={segmentationAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    expect(screen.getByText('3 points')).toBeInTheDocument();
  });

  test('calls onSelect when clicked', () => {
    render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    const item = screen.getByText('Label 1').closest('div');
    if (item) fireEvent.click(item);
    expect(mockOnSelect).toHaveBeenCalledWith(mockAnnotation.id);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    const deleteBtn = screen.getByText('✕');
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith(mockAnnotation.id);
  });

  test('applies selected class when isSelected is true', () => {
    const { container } = render(
      <AnnotationItem
        project={mockProject}
        labels={mockLabels}
        annotation={mockAnnotation}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );
    expect(container.firstChild).toHaveClass('selected');
  });
});
