import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewLabelModal from '../NewLabelModal';

describe('NewLabelModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockProjectId = 1;
  const mockApi = {
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the modal when isOpen is true', () => {
    render(
      <NewLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        projectId={mockProjectId}
        api={mockApi}
      />
    );

    expect(screen.getByText('New Label')).toBeInTheDocument();
    expect(screen.getByLabelText(/Label Name/i)).toBeInTheDocument();
  });

  test('does not render the modal when isOpen is false', () => {
    render(
      <NewLabelModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        projectId={mockProjectId}
        api={mockApi}
      />
    );

    expect(screen.queryByText('New Label')).not.toBeInTheDocument();
  });

  test('calls onSave and onClose when a label is successfully created', async () => {
    mockApi.post.mockResolvedValueOnce({ id: 3, name: 'New Label' });

    render(
      <NewLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        projectId={mockProjectId}
        api={mockApi}
      />
    );

    const input = screen.getByLabelText(/Label Name/i);
    fireEvent.change(input, { target: { value: 'Test Label' } });
    
    const saveButton = screen.getByText('Create Label');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/api/labels', {
        project_id: mockProjectId,
        name: 'Test Label'
      });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('shows error message when creation fails', async () => {
    const errorMessage = 'Failed to create label';
    mockApi.post.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <NewLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        projectId={mockProjectId}
        api={mockApi}
      />
    );

    const input = screen.getByLabelText(/Label Name/i);
    fireEvent.change(input, { target: { value: 'Test Label' } });
    
    const saveButton = screen.getByText('Create Label');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
