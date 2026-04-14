import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the latlong heading and shared ocean map copy", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /latlong/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/shared ocean map/i),
    ).toBeInTheDocument();
  });
});
