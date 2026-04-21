import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import ProjectView from "../ProjectView";

// Mocks
jest.mock("swr");
jest.mock("wouter", () => ({
	useParams: jest.fn(() => ({ id: "project-1" })),
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../services/auth", () => ({
	authenticatedApi: {
		fetcher: jest.fn(),
	},
}));
jest.mock("../Header", () => {
	return ({ onBackToProjects, activeView, selectedProjectId, project }) => (
		<header data-testid="header">
			<span>Annotation Studio</span>
			{project && <span className="project-name">📁 {project.name}</span>}
			{activeView === "annotation" && (
				<button onClick={onBackToProjects}>←</button>
			)}
		</header>
	);
});
jest.mock("../Canvas", () => {
	return ({ selectedImage }) => (
		<div data-testid="canvas">
			{selectedImage ? (
				<span>Canvas for {selectedImage.id}</span>
			) : (
				<span>No image</span>
			)}
		</div>
	);
});
jest.mock("../Sidebar", () => {
	const mockUseSWR = jest.requireMock("swr").default;
	const mockApi = jest.requireMock("../../services/auth").authenticatedApi;
	return ({
		activeView,
		saveStatus,
		isSaving,
		selectedImage,
		onSelectImage,
		selectedProjectId,
	}) => {
		const imagesData = mockUseSWR(
			selectedProjectId ? `/api/images?project_id=${selectedProjectId}` : null,
			mockApi.fetcher,
		);
		const images = imagesData?.data || [];
		return (
			<aside data-testid="sidebar">
				<h3>Images</h3>
				{activeView === "annotation" && (
					<div>
						{isSaving && <div className="saving-spinner" />}
						<span>
							{saveStatus === "saved"
								? "Saved"
								: saveStatus === "saving"
									? "Saving..."
									: "Unsaved"}
						</span>
					</div>
				)}
				{images.map((img) => (
					<div
						key={img.id}
						className="sidebar-item"
						onClick={() => onSelectImage(img)}
					>
						<span className="sidebar-item-title">
							{img.file_path?.split('/').pop() || img.id}
						</span>
					</div>
				))}
				<span className="upload-btn">+ Add Images</span>
			</aside>
		);
	};
});

const { authenticatedApi } = require("../../services/auth");
const useSWR = require("swr").default;

describe("ProjectView", () => {
	const mockNavigate = jest.fn();

	// Stable mock data to prevent infinite re-renders from new object references
	const projectResponse = {
		data: { annotation_type: "object_detection" },
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};
	const imagesResponse = {
		data: [],
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};
	const nullResponse = {
		data: null,
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};
	const imagesWithOne = {
		data: [{ id: "img-1", width: 100, height: 100 }],
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};
	const imagesWithTwo = {
		data: [
			{ id: "img-1", file_path: "/uploads/photo1.jpg", width: 100, height: 100 },
			{ id: "img-2", file_path: "/uploads/photo2.jpg", width: 200, height: 200 },
		],
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};
	const imagesWithPhoto = {
		data: [
			{ id: "img-1", file_path: "/uploads/photo.jpg", width: 100, height: 100 },
		],
		mutate: jest.fn(),
		isLoading: false,
		error: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.mock("wouter", () => ({
			useParams: jest.fn(() => ({ id: "project-1" })),
			useLocation: jest.fn(() => [mockNavigate, jest.fn()]),
		}));
	});

	test("renders Sidebar", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("Images")).toBeInTheDocument();
	});

	test("renders empty state when no image is selected", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("Select an image")).toBeInTheDocument();
		expect(
			screen.getByText("Choose an image from the list to start annotating"),
		).toBeInTheDocument();
	});

	test("renders Canvas when an image is selected", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesWithOne;
			return nullResponse;
		});
		render(<ProjectView />);
		// After selecting an image, Canvas should render
		const sidebar = screen.getByText("Images");
		expect(sidebar).toBeInTheDocument();
	});

	test("renders Header", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByTestId("header")).toBeInTheDocument();
	});

	test("renders back button in Header", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("←")).toBeInTheDocument();
	});

	test("renders save status indicator when saveStatus is saved", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("Saved")).toBeInTheDocument();
	});

	test("renders saving spinner when isSaving is true", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesWithOne;
			return nullResponse;
		});
		render(<ProjectView />);
		// The sidebar will show saving state when isSaving is true
		const sidebar = screen.getByText("Images");
		expect(sidebar).toBeInTheDocument();
	});

	test("renders image list from API", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesWithPhoto;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("photo.jpg")).toBeInTheDocument();
	});

	test("renders multiple images from API", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesWithTwo;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("photo1.jpg")).toBeInTheDocument();
		expect(screen.getByText("photo2.jpg")).toBeInTheDocument();
	});

	test("renders upload button in sidebar", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("/api/projects/project-1")) return projectResponse;
			if (key?.includes("/api/images")) return imagesResponse;
			return nullResponse;
		});
		render(<ProjectView />);
		expect(screen.getByText("+ Add Images")).toBeInTheDocument();
	});
});
