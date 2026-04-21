import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import ProjectSettings from "../ProjectSettings";

// Mocks
jest.mock("swr");
jest.mock("wouter", () => ({
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../context/ToastContext", () => ({
	useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));
jest.mock("../../services/auth", () => ({
	authenticatedApi: {
		fetcher: jest.fn(),
		post: jest.fn(),
		deleteLabel: jest.fn(),
		deleteProject: jest.fn(),
	},
}));

const { authenticatedApi } = require("../../services/auth");
const useSWR = require("swr").default;
const { useToast } = require("../../context/ToastContext");

describe("ProjectSettings", () => {
	const mockOnClose = jest.fn();
	const mockOnSave = jest.fn();
	const mockProjectId = "1";

	beforeEach(() => {
		jest.clearAllMocks();
		useToast.mockReturnValue({ showToast: jest.fn() });
	});

	test("renders loading state", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: null, mutate: jest.fn(), isLoading: true, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: true,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Data is loading ...")).toBeInTheDocument();
	});

	test("renders project settings title", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Project Settings")).toBeInTheDocument();
	});

	test("renders close button", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.queryAllByText("✕").length).toBeGreaterThan(0);
	});

	test("calls onClose when close button is clicked", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		const { container } = render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const closeModalBtn = container.querySelector(".modal-close");
		fireEvent.click(closeModalBtn);
		expect(mockOnClose).toHaveBeenCalled();
	});

	test("renders label input section", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Labels")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Add a new label..."),
		).toBeInTheDocument();
	});

	test("renders Add button", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Add")).toBeInTheDocument();
	});

	test("shows empty labels message when no labels", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("No labels configured yet.")).toBeInTheDocument();
	});

	test("renders labels when available", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return {
					data: [{ id: 1, name: "Label 1", color: "#ff0000" }],
					mutate: jest.fn(),
					isLoading: false,
					error: null,
				};
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Label 1")).toBeInTheDocument();
	});

	test("renders remove button for each label", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return {
					data: [{ id: 1, name: "Label 1", color: "#ff0000" }],
					mutate: jest.fn(),
					isLoading: false,
					error: null,
				};
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		const { container } = render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(container.querySelector(".btn-remove")).toBeInTheDocument();
	});

	test("renders annotation type section for object_detection", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Annotation Type")).toBeInTheDocument();
		expect(screen.getByText("Object Detection")).toBeInTheDocument();
	});

	test("renders annotation type section for instance_segmentation", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "instance_segmentation" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Instance Segmentation")).toBeInTheDocument();
	});

	test("does not render annotation type section for contrastive_learning", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "contrastive_learning" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.queryByText("Annotation Type")).not.toBeInTheDocument();
	});

	test("renders contrastive learning section for contrastive_learning type", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "contrastive_learning" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Contrastive Learning")).toBeInTheDocument();
	});

	test("renders Delete Project button", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Delete Project")).toBeInTheDocument();
	});

	test("renders Cancel button", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	test("renders Save Settings button", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Save Settings")).toBeInTheDocument();
	});

	test("calls onClose when Cancel button is clicked", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		fireEvent.click(screen.getByText("Cancel"));
		expect(mockOnClose).toHaveBeenCalled();
	});

	test("calls api.post when Add button is clicked with label text", async () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		authenticatedApi.post.mockResolvedValue({ id: 2, name: "New Label" });
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const input = screen.getByPlaceholderText("Add a new label...");
		fireEvent.change(input, { target: { value: "New Label" } });
		fireEvent.click(screen.getByText("Add"));

		await waitFor(() => {
			expect(authenticatedApi.post).toHaveBeenCalledWith("/api/labels", {
				project_id: mockProjectId,
				name: "New Label",
			});
		});
	});

	test("Add button is disabled when input is empty", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText("Add")).toBeDisabled();
	});

	test("Add button is disabled when label already exists", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return {
					data: [{ name: "Existing" }],
					mutate: jest.fn(),
					isLoading: false,
					error: null,
				};
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const input = screen.getByPlaceholderText("Add a new label...");
		fireEvent.change(input, { target: { value: "Existing" } });
		expect(screen.getByText("Add")).toBeDisabled();
	});

	test("calls api.deleteLabel when remove button is clicked", async () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return {
					data: [{ id: 1, name: "Label 1", color: "#ff0000" }],
					mutate: jest.fn(),
					isLoading: false,
					error: null,
				};
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		authenticatedApi.deleteLabel.mockResolvedValue({ success: true });
		const { container } = render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const removeBtn = container.querySelector(".btn-remove");
		fireEvent.click(removeBtn);

		await waitFor(() => {
			expect(authenticatedApi.deleteLabel).toHaveBeenCalledWith(1);
		});
	});

	test("shows error toast when adding label fails", async () => {
		const mockShowToast = jest.fn();
		useToast.mockReturnValue({ showToast: mockShowToast });
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		authenticatedApi.post.mockRejectedValue(new Error("Failed"));
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const input = screen.getByPlaceholderText("Add a new label...");
		fireEvent.change(input, { target: { value: "New Label" } });
		fireEvent.click(screen.getByText("Add"));

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalled();
		});
	});

	test("renders error state when project fetch fails", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: null,
				mutate: jest.fn(),
				isLoading: false,
				error: new Error("Project error"),
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText(/Error loading project/)).toBeInTheDocument();
	});

	test("renders error state when labels fetch fails", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return {
					data: null,
					mutate: jest.fn(),
					isLoading: false,
					error: new Error("Labels error"),
				};
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		expect(screen.getByText(/Error loading labels/)).toBeInTheDocument();
	});

	test("closes modal when overlay is clicked", () => {
		useSWR.mockImplementation((key) => {
			if (key?.includes("labels"))
				return { data: [], mutate: jest.fn(), isLoading: false, error: null };
			return {
				data: { annotation_type: "object_detection" },
				mutate: jest.fn(),
				isLoading: false,
				error: null,
			};
		});
		render(
			<ProjectSettings
				projectId={mockProjectId}
				onClose={mockOnClose}
				onSave={mockOnSave}
			/>,
		);
		const overlay = document.querySelector(".modal-overlay");
		fireEvent.click(overlay);
		expect(mockOnClose).toHaveBeenCalled();
	});
});
