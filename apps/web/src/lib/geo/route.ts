type CoordinateInput = {
  latitude: number;
  longitude: number;
};

type VoyagePostPoint = CoordinateInput & {
  id: string;
  posted_at: string;
};

type BuildVoyageLineInput = {
  start: CoordinateInput;
  end: CoordinateInput;
  posts: VoyagePostPoint[];
};

type LineCoordinate = [longitude: number, latitude: number];

export type VoyageLineFeature = {
  type: "Feature";
  properties: {
    pointCount: number;
  };
  geometry: {
    type: "LineString";
    coordinates: LineCoordinate[];
  };
};

function toCoordinate({ latitude, longitude }: CoordinateInput): LineCoordinate {
  return [longitude, latitude];
}

function areCoordinatesEqual(
  [leftLongitude, leftLatitude]: LineCoordinate,
  [rightLongitude, rightLatitude]: LineCoordinate,
) {
  return leftLongitude === rightLongitude && leftLatitude === rightLatitude;
}

export function buildVoyageLine({
  start,
  end,
  posts,
}: BuildVoyageLineInput): VoyageLineFeature {
  const orderedPosts = [...posts].sort((left, right) =>
    left.posted_at.localeCompare(right.posted_at),
  );

  const coordinates = [start, ...orderedPosts, end]
    .map(toCoordinate)
    .filter((coordinate, index, allCoordinates) => {
      if (index === 0) {
        return true;
      }

      return !areCoordinatesEqual(allCoordinates[index - 1], coordinate);
    });

  return {
    type: "Feature",
    properties: {
      pointCount: coordinates.length,
    },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}
