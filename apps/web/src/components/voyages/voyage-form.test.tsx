import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VoyageForm } from "./voyage-form";

describe("VoyageForm", () => {
  it("renders the voyage creation fields for a sailor log", () => {
    render(<VoyageForm action={vi.fn()} />);

    expect(screen.getByLabelText("Voyage title")).toBeInTheDocument();
    expect(screen.getByLabelText("Departure harbor")).toBeInTheDocument();
    expect(screen.getByLabelText("Departure latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Departure longitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Arrival harbor")).toBeInTheDocument();
    expect(screen.getByLabelText("Arrival latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Arrival longitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Passage notes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create voyage" }),
    ).toBeInTheDocument();
  });
});
