import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: null,
        },
      })),
    },
  })),
}));

vi.mock("@/lib/data/public-feed", () => ({
  getPublicFeed: vi.fn(async () => [
    {
      id: "voyage-1",
      userId: "user-1",
      title: "Northbound Through Glass Water",
      description: "A measured run across calm weather and bright dusk.",
      authorName: "Asha Rowan",
      createdAt: "2026-04-12T08:00:00.000Z",
      updatedAt: "2026-04-12T08:00:00.000Z",
      start: {
        name: "Cochin",
        latitude: 9.96,
        longitude: 76.27,
      },
      end: {
        name: "Muscat",
        latitude: 23.59,
        longitude: 58.41,
      },
      posts: [
        {
          id: "post-1",
          imagePath: "voyage-1/post-1.jpg",
          imageUrl: "https://example.com/post-1.jpg",
          caption: "Dusk watch.",
          latitude: 12,
          longitude: 71,
          postedAt: "2026-04-12T11:00:00.000Z",
          createdAt: "2026-04-12T11:00:00.000Z",
        },
      ],
      latestPost: {
        id: "post-1",
        imagePath: "voyage-1/post-1.jpg",
        imageUrl: "https://example.com/post-1.jpg",
        caption: "Dusk watch.",
        latitude: 12,
        longitude: 71,
        postedAt: "2026-04-12T11:00:00.000Z",
        createdAt: "2026-04-12T11:00:00.000Z",
      },
      routeLine: {
        type: "Feature" as const,
        properties: {
          pointCount: 3,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [76.27, 9.96],
            [71, 12],
            [58.41, 23.59],
          ],
        },
      },
    },
  ]),
}));

vi.mock("@/components/map/public-ocean-map", () => ({
  PublicOceanMap: () => <div data-testid="public-ocean-map" />,
}));

describe("HomePage", () => {
  it("renders only the public ocean globe on the homepage", async () => {
    render(await HomePage());

    expect(screen.getByTestId("public-ocean-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /routes told in tides, coordinates, and compressed light/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/shared ocean map/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
