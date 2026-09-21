import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationForm } from "@/components/events/registration-form";

// The real widget loads Cloudflare's script; the stub hands out a token at once.
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess?: (token: string) => void }) => {
    useEffect(() => onSuccess?.("turnstile-token"), [onSuccess]);
    return null;
  },
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, submitRegistration: vi.fn() };
});

import { RegistrationError, submitRegistration } from "@/lib/api";
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
function consentBox() {
  return screen.getByRole("checkbox");
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
    await user.click(consentBox());
    await user.click(submitButton());

    expect(await screen.findByText(/courriel invalide/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("requires consent before submitting", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Jean Test");
    await user.type(emailInput(), "jean@test.com");
    await user.click(submitButton());

    expect(await screen.findByText(/consentement est requis/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("submits successfully with valid data", async () => {
    mockSubmit.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Jean Test");
    await user.type(emailInput(), "jean@test.com");
    await user.click(consentBox());
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByText(/inscription reçue/i)).toBeInTheDocument();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      event: "evt-1",
      name: "Jean Test",
      email: "jean@test.com",
      phone: undefined,
      consent: true,
      turnstileToken: "turnstile-token",
    });
  });

  it("shows the server's reason when the registration is refused", async () => {
    mockSubmit.mockRejectedValueOnce(new RegistrationError("Les inscriptions à cet événement sont fermées."));
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Jean Test");
    await user.type(emailInput(), "jean@test.com");
    await user.click(consentBox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(/inscriptions à cet événement sont fermées/i);
  });

  it("does not submit when honeypot is filled", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm eventId="evt-1" />);

    await user.type(nameInput(), "Bot");
    await user.type(emailInput(), "bot@spam.com");
    await user.click(consentBox());

    const honeypot = document.getElementById("website") as HTMLInputElement;
    await user.type(honeypot, "http://spam.com");

    await user.click(submitButton());

    await new Promise((r) => setTimeout(r, 50));
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
