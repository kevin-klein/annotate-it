import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import useSWR from "swr";
import Header from "../Header";

// Mocks
jest.mock("swr");
jest.mock("wouter", () => ({
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../services/auth", () => ({
	authenticatedApi: {
		fetcher: jest.fn(),
	},
}));

describe("Header", () => {
	const defaultProps = {
		activeView: "annotation",
		selectedProjectId: "project-123",
		onBackToProjects: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders the logo", () => {
		useSWR.mockReturnValue({ data: null, error: null });
		render(<Header {...defaultProps} />);
		expect(screen.getByText("Annotation Studio")).toBeInTheDocument();
	});

	test("renders project name when project data is available", () => {
		useSWR.mockReturnValue({
			data: { name: "My Project", annotation_type: "object_detection" },
			error: null,
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByText("📁 My Project")).toBeInTheDocument();
	});

	test("renders detection type badge", () => {
		useSWR.mockReturnValue({
			data: { name: "Test", annotation_type: "object_detection" },
			error: null,
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByText("🔲 Detection")).toBeInTheDocument();
	});

	test("renders segmentation type badge", () => {
		useSWR.mockReturnValue({
			data: { name: "Test", annotation_type: "instance_segmentation" },
			error: null,
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByText("🔷 Segmentation")).toBeInTheDocument();
	});

	test("renders contrastive type badge", () => {
		useSWR.mockReturnValue({
			data: { name: "Test", annotation_type: "contrastive_learning" },
			error: null,
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByText("⚖️ Contrastive")).toBeInTheDocument();
	});

	test("renders back button", () => {
		useSWR.mockReturnValue({
			data: { name: "Test", annotation_type: "object_detection" },
			error: null,
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByTitle("Back to projects")).toBeInTheDocument();
	});

	test("calls onBackToProjects when back button is clicked", () => {
		const mockNavigate = jest.fn();
		jest.mock("wouter", () => ({
			useLocation: jest.fn(() => [mockNavigate, jest.fn()]),
		}));
		jest.isolateModules(() => {
			useSWR.mockReturnValue({
				data: { name: "Test", annotation_type: "object_detection" },
				error: null,
			});
			const { default: HeaderComp } = require("../Header");
			render(<HeaderComp {...defaultProps} />);
			fireEvent.click(screen.getByTitle("Back to projects"));
			expect(defaultProps.onBackToProjects).toHaveBeenCalled();
		});
	});

	test("shows error message when project fetch fails", () => {
		useSWR.mockReturnValue({
			data: null,
			error: new Error("Network error"),
		});
		render(<Header {...defaultProps} />);
		expect(screen.getByText("Error loading project")).toBeInTheDocument();
	});

	test("does not render project info when no project data", () => {
		useSWR.mockReturnValue({ data: null, error: null });
		render(<Header {...defaultProps} />);
		expect(screen.queryByText("📁")).not.toBeInTheDocument();
		expect(screen.queryByTitle("Back to projects")).not.toBeInTheDocument();
	});
});
