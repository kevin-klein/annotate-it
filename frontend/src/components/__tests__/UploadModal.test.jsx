import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadModal from '../UploadModal';

describe('UploadModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpload = jest.fn();
  const mockSetUploadProgress = jest.fn();
  const mockSetInternalError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    render(
      <UploadModal
        isOpen={false}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
      />
    );
    expect(screen.queryByText('Upload Images')).not.toBeInTheDocument();
  });

  test('renders the modal when isOpen is true', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
      />
    );
    expect(screen.getByText('Upload Images')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
      />
    );
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onUpload when a file is selected', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
      />
    );

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    
    if (!input) {
        throw new Error('Input not found');
    }

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnUpload).toHaveBeenCalledWith(file, expect.any(Function), expect.any(Function));
  });

  test('shows progress bar when uploading', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
        uploading={true}
        uploadProgress={50}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('shows error message when upload fails', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
        setUploadProgress={mockSetUploadProgress}
        setInternalError={mockSetInternalError}
        uploadError="Upload failed"
      />
    );

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });
});
