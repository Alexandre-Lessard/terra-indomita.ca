import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationForm } from "@/components/events/registration-form";

vi.mock("@/lib/api", () => ({
  submitRegistration: vi.fn(),
}));

import { submitRegistration } from "@/lib/api";
const mockSubmit = vi.mocked(submitRegistration);

beforeEach(() => {
  mockSubmit.mockReset();
});

afterEach(() => {
  cleanup();
});

function nameInput() {
  return screen.getByPlaceholderText("Votre nom");
}
function emailInput() {
  return screen.getByPlaceholderText("votre@courriel.com");
}
function submitButton() {
  return screen.getByRole("button", { name: /s'inscrire/i });
}

describe("RegistrationForm", () => {
  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.click(submitButton());

    expect(await screen.findByText(/le nom est requis/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("does not submit with invalid email", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Jean Test");
    await user.type(emailInput(), "invalid");
    await user.click(submitButton());

    // Wait a tick for form handler to run
    await new Promise((r) => setTimeout(r, 100));
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("submits successfully with valid data", async () => {
    mockSubmit.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Jean Test");
    await user.type(emailInput(), "jean@test.com");
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/inscription envoyée/i)).toBeInTheDocument();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      event: "evt-1",
      name: "Jean Test",
      email: "jean@test.com",
      phone: undefined,
    });
  });

  it("does not submit when honeypot is filled", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Bot");
    await user.type(emailInput(), "bot@spam.com");

    const honeypot = document.getElementById("website") as HTMLInputElement;
    await user.type(honeypot, "http://spam.com");

    await user.click(submitButton());

    // Wait a tick to ensure form handler ran
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
