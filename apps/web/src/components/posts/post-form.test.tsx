import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PostForm } from "./post-form"

describe("PostForm", () => {
  const originalGeolocation = navigator.geolocation

  beforeEach(() => {
    Object.defineProperty(global.URL, "createObjectURL", {
      value: vi.fn(() => "blob:preview"),
      configurable: true,
    })
    Object.defineProperty(global.URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    })
  })

  it("renders the voyage publishing fields", () => {
    render(
      <PostForm
        action={vi.fn()}
        voyageId="voyage-1"
        voyageTitle="Arabian Sea Night Run"
        departureLabel="Kochi"
        arrivalLabel="Muscat"
      />,
    )

    expect(screen.getByLabelText("Signal photo")).toBeInTheDocument()
    expect(screen.getByLabelText("Caption")).toBeInTheDocument()
    expect(screen.getByLabelText("Latitude")).toBeInTheDocument()
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument()
    expect(screen.getByLabelText("Signal timestamp")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publish signal" })).toBeInTheDocument()
  })

  it("fills coordinates from the browser geolocation API", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn((success: (position: GeolocationPosition) => void) =>
          success({
            coords: {
              latitude: 18.4663,
              longitude: -66.1057,
            },
          } as GeolocationPosition),
        ),
      },
      configurable: true,
    })

    render(
      <PostForm
        action={vi.fn()}
        voyageId="voyage-1"
        voyageTitle="Arabian Sea Night Run"
        departureLabel="Kochi"
        arrivalLabel="Muscat"
      />,
    )

    fireEvent.click(screen.getAllByRole("button", { name: "Use current location" })[0])

    await waitFor(() => {
      expect(screen.getByLabelText("Latitude")).toHaveValue(18.4663)
      expect(screen.getByLabelText("Longitude")).toHaveValue(-66.1057)
    })
  })
})
