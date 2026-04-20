import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import ProjectSelection from "../ProjectSelection";

// Mocks
jest.mock("swr");
jest.mock("wouter", () => ({
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../services/auth", () => ({
	authenticatedApi: {
		fetcher: jest.fn(),
		post: jest.fn(),
	},
}));

const { authenticatedApi } = require("../../services/auth");
const useSWR = require("swr").default;

describe("ProjectSelection", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders the title", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("Annotate-IT")).toBeInTheDocument();
	});

	test("renders subtitle", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(
			screen.getByText("Select or create a project to begin"),
		).toBeInTheDocument();
	});

	test("shows loading state when data is loading", () => {
		useSWR.mockReturnValue({
			data: null,
			mutate: jest.fn(),
			isLoading: true,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("Loading ...")).toBeInTheDocument();
	});

	test("shows error when data fetch fails", () => {
		useSWR.mockReturnValue({
			data: null,
			mutate: jest.fn(),
			isLoading: false,
			error: new Error("Network error"),
		});
		render(<ProjectSelection />);
		expect(screen.getByText(/Error loading projects/)).toBeInTheDocument();
	});

	test("renders existing projects when available", () => {
		const mockProjects = [
			{
				id: 1,
				name: "Project A",
				type: "object_detection",
				description: "Desc A",
			},
			{
				id: 2,
				name: "Project B",
				type: "instance_segmentation",
				description: "Desc B",
			},
		];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("Project A")).toBeInTheDocument();
		expect(screen.getByText("Project B")).toBeInTheDocument();
	});

	test("renders project type labels", () => {
		const mockProjects = [{ id: 1, name: "Test", type: "object_detection" }];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("Object Detection")).toBeInTheDocument();
	});

	test("renders settings button for each project", () => {
		const mockProjects = [{ id: 1, name: "Test", type: "object_detection" }];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("⚙️ Settings")).toBeInTheDocument();
	});

	test("renders New Project button when no projects exist", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("+ New Project")).toBeInTheDocument();
	});

	test("renders New Project button when projects exist", () => {
		const mockProjects = [{ id: 1, name: "Test", type: "object_detection" }];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("+ New Project")).toBeInTheDocument();
	});

	test("shows create form when New Project button is clicked", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		expect(screen.getByText("Select Project Type:")).toBeInTheDocument();
	});

	test("renders all three project type buttons", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		expect(screen.getByText("Object Detection")).toBeInTheDocument();
		expect(screen.getByText("Instance Segmentation")).toBeInTheDocument();
		expect(screen.getByText("Contrastive Learning")).toBeInTheDocument();
	});

	test("shows form fields after type is selected", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		expect(screen.getByPlaceholderText("Project Name")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Description (optional)"),
		).toBeInTheDocument();
	});

	test("renders Cancel and Create Project buttons after type selection", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Create Project")).toBeInTheDocument();
	});

	test("Create Project button is disabled when name is empty", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		expect(screen.getByText("Create Project")).toBeDisabled();
	});

	test("Create Project button is enabled when name is provided", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		const nameInput = screen.getByPlaceholderText("Project Name");
		fireEvent.change(nameInput, { target: { value: "New Project" } });
		expect(screen.getByText("Create Project")).toBeEnabled();
	});

	test("hides create form when Cancel is clicked", () => {
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		fireEvent.click(screen.getByText("Cancel"));
		expect(screen.queryByText("Select Project Type:")).not.toBeInTheDocument();
	});

	test("calls api.post when Create Project is submitted with valid data", async () => {
		authenticatedApi.post.mockResolvedValue({
			success: true,
			project: { id: 99 },
		});
		useSWR.mockReturnValue({
			data: [],
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		fireEvent.click(screen.getByText("+ New Project"));
		fireEvent.click(screen.getByText("Object Detection"));
		fireEvent.change(screen.getByPlaceholderText("Project Name"), {
			target: { value: "My Project" },
		});
		fireEvent.change(screen.getByPlaceholderText("Description (optional)"), {
			target: { value: "A test project" },
		});
		fireEvent.click(screen.getByText("Create Project"));

		await waitFor(() => {
			expect(authenticatedApi.post).toHaveBeenCalledWith("/api/projects", {
				name: "My Project",
				description: "A test project",
				annotation_type: "object_detection",
			});
		});
	});

	test("renders project description when provided", () => {
		const mockProjects = [
			{
				id: 1,
				name: "Test",
				type: "object_detection",
				description: "A great project",
			},
		];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("A great project")).toBeInTheDocument();
	});

	test("renders correct icon for instance_segmentation", () => {
		const mockProjects = [
			{ id: 1, name: "Seg", type: "instance_segmentation" },
		];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("🔷")).toBeInTheDocument();
	});

	test("renders correct icon for contrastive_learning", () => {
		const mockProjects = [
			{ id: 1, name: "Contrast", type: "contrastive_learning" },
		];
		useSWR.mockReturnValue({
			data: mockProjects,
			mutate: jest.fn(),
			isLoading: false,
			error: null,
		});
		render(<ProjectSelection />);
		expect(screen.getByText("⚖️")).toBeInTheDocument();
	});
});
