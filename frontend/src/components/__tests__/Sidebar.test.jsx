import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import useSWR from 'swr';
import { authenticatedApi as api } from '../../services/auth';
import UploadModal from '../UploadModal';
import Sidebar from '../Sidebar';

// Mocks
jest.mock('swr');
jest.mock('../../services/auth', () => ({
  authenticatedApi: {
    fetcher: jest.fn(),
  },
  authService: {}
}));
jest.mock('../UploadModal', () => {
  return jest.fn(({ isOpen, onClose, onUpload, uploading, setUploadProgress, uploadProgress, uploadError }) => (
    isOpen ? (
      <div data-testid="upload-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onUpload(new File([''], 'test.png'), jest.fn(), jest.fn())}>Trigger Upload</button>
      </div>
    ) : null
  ));
});

describe('Sidebar Component', () => {
  const defaultProps = {
    activeView: 'images',
    selectedProjectId: 'project-123',
    selectedImage: null,
    onSelectImage: jest.fn(),
    saveStatus: '',
    isSaving: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly for activeView === "images"', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Images')).toBeInTheDocument();
  });

  test('renders correctly for activeView === "annotation"', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} activeView="annotation" saveStatus="saved" />);
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  test('shows empty state when no images are present', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('No images yet')).toBeInTheDocument();
  });

  test('renders image list and calls onSelectImage when an image is clicked', () => {
    const mockImages = [
      { id: 'img-1', original_name: 'image1.png', width: 100, height: 100, created_at: '2023-01-01T00:00:00Z' },
      { id: 'img-2', original_name: 'image2.png', width: 200, height: 200, created_at: '2023-01-02T00:00:00Z' },
    ];
    useSWR.mockReturnValue({ data: mockImages, mutate: jest.fn() });
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('image1.png')).toBeInTheDocument();
    expect(screen.getByText('image2.png')).toBeInTheDocument();

    fireEvent.click(screen.getByText('image1.png'));
    expect(defaultProps.onSelectImage).toHaveBeenCalledWith(mockImages[0]);
  });

  test('shows isSaving spinner when isSaving is true', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} isSaving={true} />);
    expect(screen.getByText('Saving annotations...')).toBeInTheDocument();
    expect(document.querySelector('.saving-spinner')).toBeInTheDocument();
  });

  test('shows saveStatus text', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} activeView="annotation" saveStatus="Unsaved" />);
    expect(screen.getByText('Unsaved')).toBeInTheDocument();

    render(<Sidebar {...defaultProps} activeView="annotation" saveStatus="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  test('opens UploadModal when "+ Add Image" is clicked', () => {
    useSWR.mockReturnValue({ data: [], mutate: jest.fn() });
    render(<Sidebar {...defaultProps} />);

    // In 'images' view, the button text is '+ Add Images'
    const addButton = screen.getByText('+ Add Images');
    fireEvent.click(addButton);

    expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
  });
});
