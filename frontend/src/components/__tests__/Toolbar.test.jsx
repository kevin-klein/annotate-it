import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar from '../Toolbar';

describe('Toolbar', () => {
  const defaultProps = {
    scale: 1,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    projectType: 'object_detection',
    tool: 'hand',
    onToolChange: jest.fn(),
    onExport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the project type label for object_detection', () => {
    render(<Toolbar {...defaultProps} projectType="object_detection" />);
    expect(screen.getByText('Object Detection')).toBeInTheDocument();
  });

  test('renders the project type label for instance_segmentation', () => {
    render(<Toolbar {...defaultProps} projectType="instance_segmentation" />);
    expect(screen.getByText('Instance Segmentation')).toBeInTheDocument();
  });

  test('renders the project type label for contrastive_learning', () => {
    render(<Toolbar {...defaultProps} projectType="contrastive_learning" />);
    expect(screen.getByText('Contrastive Learning')).toBeInTheDocument();
  });

  test('renders default label for unknown project type', () => {
    render(<Toolbar {...defaultProps} projectType="unknown_type" />);
    expect(screen.getByText('Annotation Tool')).toBeInTheDocument();
  });

  test('renders Hand and Draw buttons', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Hand')).toBeInTheDocument();
    expect(screen.getByText('Draw')).toBeInTheDocument();
  });

  test('renders zoom buttons', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('+ Zoom')).toBeInTheDocument();
    expect(screen.getByText('- Zoom')).toBeInTheDocument();
  });

  test('renders export button', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText(/Export/)).toBeInTheDocument();
  });

  test('applies active class to Hand button when tool is hand', () => {
    const { rerender } = render(<Toolbar {...defaultProps} tool="hand" />);
    const handBtn = screen.getByText('Hand');
    expect(handBtn).toHaveClass('active');

    rerender(<Toolbar {...defaultProps} tool="add" />);
    expect(handBtn).not.toHaveClass('active');
  });

  test('applies active class to Draw button when tool is add', () => {
    const { rerender } = render(<Toolbar {...defaultProps} tool="add" />);
    const drawBtn = screen.getByText('Draw');
    expect(drawBtn).toHaveClass('active');

    rerender(<Toolbar {...defaultProps} tool="hand" />);
    expect(drawBtn).not.toHaveClass('active');
  });

  test('calls onToolChange with hand when Hand button is clicked', () => {
    render(<Toolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('Hand'));
    expect(defaultProps.onToolChange).toHaveBeenCalledWith('hand');
  });

  test('calls onToolChange with add when Draw button is clicked', () => {
    render(<Toolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('Draw'));
    expect(defaultProps.onToolChange).toHaveBeenCalledWith('add');
  });

  test('calls onZoomIn when zoom in button is clicked', () => {
    render(<Toolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('+ Zoom'));
    expect(defaultProps.onZoomIn).toHaveBeenCalled();
  });

  test('calls onZoomOut when zoom out button is clicked', () => {
    render(<Toolbar {...defaultProps} />);
    fireEvent.click(screen.getByText('- Zoom'));
    expect(defaultProps.onZoomOut).toHaveBeenCalled();
  });

  test('calls onExport when export button is clicked', () => {
    render(<Toolbar {...defaultProps} />);
    fireEvent.click(screen.getByText(/Export/));
    expect(defaultProps.onExport).toHaveBeenCalled();
  });

  test('renders disabled project type button', () => {
    render(<Toolbar {...defaultProps} />);
    const typeBtn = screen.getByText('Object Detection');
    expect(typeBtn).toBeDisabled();
  });

  test('does not render project type button when projectType is null', () => {
    render(<Toolbar {...defaultProps} projectType={null} />);
    expect(screen.queryByText('Annotation Tool')).not.toBeInTheDocument();
  });
});
