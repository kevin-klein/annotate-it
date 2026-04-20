import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import LoginForm from "../LoginForm";

// Mocks
jest.mock("wouter", () => ({
	useLocation: jest.fn(() => [jest.fn(), jest.fn()]),
}));
jest.mock("../../services/auth", () => ({
	authService: {
		requestLoginCode: jest.fn(),
		verifyLoginCode: jest.fn(),
	},
}));

const { authService } = require("../../services/auth");

describe("LoginForm", () => {
	const mockOnLoginSuccess = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		authService.requestLoginCode.mockResolvedValue({ success: true });
		authService.verifyLoginCode.mockResolvedValue({ token: "test-token" });
	});

	test("renders email input and submit button", () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
		expect(screen.getByText("Send Login Code")).toBeInTheDocument();
	});

	test("renders login title", () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		expect(screen.getByText("Login")).toBeInTheDocument();
	});

	test("calls authService.requestLoginCode when form is submitted", async () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(authService.requestLoginCode).toHaveBeenCalledWith(
				"test@example.com",
			);
		});
	});

	test("shows loading state during submission", async () => {
		const delay = new Promise((resolve) => setTimeout(resolve, 100));
		authService.requestLoginCode.mockReturnValue(delay);

		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		const submitBtn = screen.getByText("Send Login Code");
		fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(screen.getByText("Sending code...")).toBeInTheDocument();
		});
	});

	test("shows error message when requestLoginCode fails", async () => {
		authService.requestLoginCode.mockRejectedValue(new Error("Invalid email"));

		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Invalid email")).toBeInTheDocument();
		});
	});

	test("shows code verification screen after successful email submission", async () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Check Your Email")).toBeInTheDocument();
			expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
			expect(screen.getByLabelText(/Login Code/i)).toBeInTheDocument();
			expect(screen.getByText("Verify Code")).toBeInTheDocument();
			expect(screen.getByText("Back to Email")).toBeInTheDocument();
		});
	});

	test("calls authService.verifyLoginCode when code is submitted", async () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Check Your Email")).toBeInTheDocument();
		});

		const codeInput = screen.getByLabelText(/Login Code/i);
		fireEvent.change(codeInput, { target: { value: "123456" } });
		fireEvent.click(screen.getByText("Verify Code"));

		await waitFor(() => {
			expect(authService.verifyLoginCode).toHaveBeenCalledWith(
				"test@example.com",
				"123456",
			);
		});
	});

	test("calls onLoginSuccess when code verification succeeds", async () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Check Your Email")).toBeInTheDocument();
		});

		const codeInput = screen.getByLabelText(/Login Code/i);
		fireEvent.change(codeInput, { target: { value: "123456" } });
		fireEvent.click(screen.getByText("Verify Code"));

		await waitFor(() => {
			expect(mockOnLoginSuccess).toHaveBeenCalled();
		});
	});

	test("shows error message when code verification fails", async () => {
		authService.verifyLoginCode.mockRejectedValue(new Error("Invalid code"));

		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Check Your Email")).toBeInTheDocument();
		});

		const codeInput = screen.getByLabelText(/Login Code/i);
		fireEvent.change(codeInput, { target: { value: "wrongcode" } });
		fireEvent.click(screen.getByText("Verify Code"));

		await waitFor(() => {
			expect(screen.getByText("Invalid code")).toBeInTheDocument();
		});
	});

	test("goes back to email form when cancel is clicked on code screen", async () => {
		render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />);
		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.click(screen.getByText("Send Login Code"));

		await waitFor(() => {
			expect(screen.getByText("Check Your Email")).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText("Back to Email"));

		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
	});
});
