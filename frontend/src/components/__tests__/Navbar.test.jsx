import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import Navbar from "../Navbar";

// Mocks
jest.mock("wouter", () => ({
	Link: ({ to, children }) => <a href={to}>{children}</a>,
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../services/auth", () => ({
	authService: {
		isAuthenticated: jest.fn(),
		logout: jest.fn(),
	},
}));

const { authService } = require("../../services/auth");

describe("Navbar", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders the brand name", () => {
		render(<Navbar />);
		expect(screen.getByText("Annotate")).toBeInTheDocument();
	});

	test("renders Login link when not authenticated", () => {
		authService.isAuthenticated.mockReturnValue(false);
		render(<Navbar />);
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.queryByText("Projects")).not.toBeInTheDocument();
		expect(screen.queryByText("Logout")).not.toBeInTheDocument();
	});

	test("renders Projects and Logout when authenticated", () => {
		authService.isAuthenticated.mockReturnValue(true);
		render(<Navbar />);
		expect(screen.getByText("Projects")).toBeInTheDocument();
		expect(screen.getByText("Logout")).toBeInTheDocument();
		expect(screen.queryByText("Login")).not.toBeInTheDocument();
	});

	test("Login link points to /login", () => {
		authService.isAuthenticated.mockReturnValue(false);
		render(<Navbar />);
		const loginLink = screen.getByText("Login").closest("a");
		expect(loginLink).toHaveAttribute("href", "/login");
	});

	test("Projects link points to /projects", () => {
		authService.isAuthenticated.mockReturnValue(true);
		render(<Navbar />);
		const projectsLink = screen.getByText("Projects").closest("a");
		expect(projectsLink).toHaveAttribute("href", "/projects");
	});

	test("Brand link points to /", () => {
		authService.isAuthenticated.mockReturnValue(false);
		render(<Navbar />);
		const brandLink = screen.getByText("Annotate").closest("a");
		expect(brandLink).toHaveAttribute("href", "/");
	});

	test("calls authService.logout when Logout button is clicked", async () => {
		authService.isAuthenticated.mockReturnValue(true);
		authService.logout.mockResolvedValue({});
		render(<Navbar />);
		fireEvent.click(screen.getByText("Logout"));
		await Promise.resolve();
		expect(authService.logout).toHaveBeenCalled();
	});
});
