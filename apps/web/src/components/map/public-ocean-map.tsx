"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { LayerProps, MapRef, StyleSpecification } from "react-map-gl/maplibre";
import { Layer, Map, NavigationControl, Source } from "react-map-gl/maplibre";

import type { PublicVoyage } from "@/lib/data/public-feed";

type GeoJSONPosition = [number, number];

type GeoJSONPointFeature = {
  type: "Feature";
  properties: {
    voyageId: string;
    title: string;
    caption: string;
    isActive: boolean;
  };
  geometry: {
    type: "Point";
    coordinates: GeoJSONPosition;
  };
};

type GeoJSONLineFeature = {
  type: "Feature";
  properties: {
    pointCount: number;
    voyageId: string;
    title: string;
    isActive: boolean;
  };
  geometry: {
    type: "LineString";
    coordinates: GeoJSONPosition[];
  };
};

type GeoJSONFeatureCollection<TFeature> = {
  type: "FeatureCollection";
  features: TFeature[];
};

type PublicOceanMapProps = {
  voyages: PublicVoyage[];
  activeVoyageId?: string;
  className?: string;
};

const OCEAN_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#03111d",
      },
    },
    {
      id: "carto-dark",
      type: "raster",
      source: "carto",
      paint: {
        "raster-opacity": 0.92,
        "raster-saturation": -0.35,
        "raster-contrast": 0.18,
        "raster-brightness-min": 0.05,
        "raster-brightness-max": 0.72,
      },
    },
  ],
};

const routeLineLayer: LayerProps = {
  id: "voyage-routes",
  type: "line",
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "isActive"], true],
      "#d8b36a",
      "#8ed3ef",
    ],
    "line-opacity": [
      "case",
      ["==", ["get", "isActive"], true],
      0.95,
      0.48,
    ],
    "line-width": [
      "case",
      ["==", ["get", "isActive"], true],
      4,
      2,
    ],
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const pointLayer: LayerProps = {
  id: "voyage-points",
  type: "circle",
  paint: {
    "circle-radius": [
      "case",
      ["==", ["get", "isActive"], true],
      6,
      4,
    ],
    "circle-color": [
      "case",
      ["==", ["get", "isActive"], true],
      "#fff7e8",
      "#8ed3ef",
    ],
    "circle-stroke-width": 1.5,
    "circle-stroke-color": "#082030",
    "circle-opacity": 0.92,
  },
};

function buildBounds(voyages: PublicVoyage[], activeVoyageId?: string) {
  const activeVoyage = activeVoyageId
    ? voyages.find((voyage) => voyage.id === activeVoyageId)
    : null;
  const relevantVoyages = activeVoyage ? [activeVoyage] : voyages;

  if (relevantVoyages.length === 0) {
    return null;
  }

  const bounds = new maplibregl.LngLatBounds();

  for (const voyage of relevantVoyages) {
    for (const [longitude, latitude] of voyage.routeLine.geometry.coordinates) {
      bounds.extend([longitude, latitude]);
    }
  }

  return bounds;
}

export function PublicOceanMap({
  voyages,
  activeVoyageId,
  className,
}: PublicOceanMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const activeVoyage =
    voyages.find((voyage) => voyage.id === activeVoyageId) ?? voyages[0] ?? null;

  useEffect(() => {
    const bounds = buildBounds(voyages, activeVoyageId);

    if (!bounds || bounds.isEmpty()) {
      return;
    }

    mapRef.current?.fitBounds(bounds, {
      padding: 72,
      duration: 0,
      maxZoom: activeVoyageId ? 6.8 : 3.6,
    });
  }, [activeVoyageId, voyages]);

  const routeFeatures: GeoJSONFeatureCollection<GeoJSONLineFeature> = {
    type: "FeatureCollection",
    features: voyages.map((voyage) => ({
      ...voyage.routeLine,
      properties: {
        ...voyage.routeLine.properties,
        voyageId: voyage.id,
        title: voyage.title,
        isActive: voyage.id === activeVoyage?.id,
      },
    })),
  };

  const pointFeatures: GeoJSONFeatureCollection<GeoJSONPointFeature> = {
    type: "FeatureCollection",
    features: voyages.flatMap((voyage) =>
      voyage.posts.map((post) => ({
        type: "Feature" as const,
        properties: {
          voyageId: voyage.id,
          title: voyage.title,
          caption: post.caption,
          isActive: voyage.id === activeVoyage?.id,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [post.longitude, post.latitude] as [number, number],
        },
      })),
    ),
  };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#071825]/90 shadow-[0_30px_80px_rgba(0,0,0,0.35)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(142,211,239,0.16),transparent_36%),linear-gradient(180deg,rgba(3,10,18,0.1),rgba(3,10,18,0.52))]" />
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-5 text-[0.68rem] uppercase tracking-[0.3em] text-[#d7ccb5]/78">
        <div>
          <p>Shared Ocean</p>
          <p className="mt-2 text-[0.6rem] tracking-[0.24em] text-[#8bbcd0]">
            Public routes drifting in real coordinates
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-[#091a28]/70 px-3 py-2 text-right text-[0.6rem] tracking-[0.24em] text-[#f4efe3]/80 backdrop-blur">
          <p>{voyages.length || 0} voyages visible</p>
          <p className="mt-1 text-[#8ed3ef]/78">
            {activeVoyage ? activeVoyage.title : "Awaiting first departure"}
          </p>
        </div>
      </div>

      {voyages.length > 0 ? (
        <>
          <div className="h-[420px] w-full">
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 0,
                latitude: 10,
                zoom: 1.6,
              }}
              mapLib={maplibregl}
              mapStyle={OCEAN_STYLE}
              attributionControl={false}
              dragRotate={false}
              touchPitch={false}
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControl position="bottom-right" showCompass={false} />
              <Source id="voyage-routes" type="geojson" data={routeFeatures}>
                <Layer {...routeLineLayer} />
              </Source>
              <Source id="voyage-points" type="geojson" data={pointFeatures}>
                <Layer {...pointLayer} />
              </Source>
            </Map>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 bg-[linear-gradient(180deg,rgba(3,10,18,0),rgba(3,10,18,0.92))] px-5 py-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#8bbcd0]">
                Highlighted route
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#fff7e8]">
                {activeVoyage?.title ?? "No route selected"}
              </p>
              {activeVoyage ? (
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#d8e1e8]">
                  {activeVoyage.start.name} to {activeVoyage.end.name}
                  {" · "}
                  {activeVoyage.posts.length} logged positions by{" "}
                  {activeVoyage.authorName}
                </p>
              ) : null}
            </div>
            <p className="max-w-xs text-right text-xs leading-5 text-[#d7ccb5]/70">
              Tiles by OpenStreetMap and CARTO. Routes intensify when a voyage is in focus.
            </p>
          </div>
        </>
      ) : (
        <div className="flex h-[420px] flex-col items-center justify-center px-6 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            Empty chart
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
            No public voyages yet
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#d8e1e8]">
            The feed is ready for routes, waypoints, and compressed photo logs as soon as the first crew shares a passage.
          </p>
        </div>
      )}
    </div>
  );
}
