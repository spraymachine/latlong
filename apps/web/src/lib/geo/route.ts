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

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function areCoordinatesEqual(
  [leftLongitude, leftLatitude]: LineCoordinate,
  [rightLongitude, rightLatitude]: LineCoordinate,
) {
  return leftLongitude === rightLongitude && leftLatitude === rightLatitude;
}

function areCoordinatesNearlyEqual(
  [leftLongitude, leftLatitude]: LineCoordinate,
  [rightLongitude, rightLatitude]: LineCoordinate,
) {
  return (
    Math.abs(leftLongitude - rightLongitude) < 0.000001 &&
    Math.abs(leftLatitude - rightLatitude) < 0.000001
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeLongitude(longitude: number) {
  let normalized = longitude;

  while (normalized <= -180) {
    normalized += 360;
  }

  while (normalized > 180) {
    normalized -= 360;
  }

  return normalized;
}

function roundCoordinateValue(value: number) {
  return Number(value.toFixed(6));
}

function alignLongitude(longitude: number, previousLongitude?: number) {
  if (previousLongitude === undefined) {
    return normalizeLongitude(longitude);
  }

  let aligned = longitude;

  while (aligned - previousLongitude > 180) {
    aligned -= 360;
  }

  while (aligned - previousLongitude < -180) {
    aligned += 360;
  }

  return aligned;
}

function estimateSegmentSteps(
  [startLongitude, startLatitude]: LineCoordinate,
  [endLongitude, endLatitude]: LineCoordinate,
) {
  const latitudeDelta = Math.abs(endLatitude - startLatitude);
  const longitudeDelta = Math.abs(endLongitude - startLongitude);
  const angularDistance = Math.hypot(latitudeDelta, longitudeDelta);

  return clamp(Math.ceil(angularDistance / 8), 1, 18);
}

function interpolateGreatCircleSegment(
  start: LineCoordinate,
  end: LineCoordinate,
): LineCoordinate[] {
  if (areCoordinatesEqual(start, end)) {
    return [start];
  }

  const [startLongitude, startLatitude] = start;
  const [endLongitude, endLatitude] = end;
  const startLatitudeRadians = toRadians(startLatitude);
  const endLatitudeRadians = toRadians(endLatitude);
  const startLongitudeRadians = toRadians(startLongitude);
  const endLongitudeRadians = toRadians(endLongitude);

  const startVector = {
    x: Math.cos(startLatitudeRadians) * Math.cos(startLongitudeRadians),
    y: Math.cos(startLatitudeRadians) * Math.sin(startLongitudeRadians),
    z: Math.sin(startLatitudeRadians),
  };

  const endVector = {
    x: Math.cos(endLatitudeRadians) * Math.cos(endLongitudeRadians),
    y: Math.cos(endLatitudeRadians) * Math.sin(endLongitudeRadians),
    z: Math.sin(endLatitudeRadians),
  };

  const omega = Math.acos(
    clamp(
      startVector.x * endVector.x +
        startVector.y * endVector.y +
        startVector.z * endVector.z,
      -1,
      1,
    ),
  );

  const steps = estimateSegmentSteps(start, end);

  if (omega === 0) {
    return [start, end];
  }

  const sinOmega = Math.sin(omega);
  const coordinates: LineCoordinate[] = [];
  let previousLongitude: number | undefined;

  for (let index = 0; index <= steps; index += 1) {
    const fraction = index / steps;
    const startScale = Math.sin((1 - fraction) * omega) / sinOmega;
    const endScale = Math.sin(fraction * omega) / sinOmega;
    const x = startScale * startVector.x + endScale * endVector.x;
    const y = startScale * startVector.y + endScale * endVector.y;
    const z = startScale * startVector.z + endScale * endVector.z;
    const longitude = roundCoordinateValue(
      alignLongitude(toDegrees(Math.atan2(y, x)), previousLongitude),
    );
    const latitude = roundCoordinateValue(
      toDegrees(Math.atan2(z, Math.hypot(x, y))),
    );

    previousLongitude = longitude;
    coordinates.push([longitude, latitude]);
  }

  return coordinates;
}

export function buildVoyageLine({
  start,
  end,
  posts,
}: BuildVoyageLineInput): VoyageLineFeature {
  const orderedPosts = [...posts].sort((left, right) =>
    left.posted_at.localeCompare(right.posted_at),
  );

  const anchorCoordinates = [start, ...orderedPosts, end]
    .map(toCoordinate)
    .filter((coordinate, index, allCoordinates) => {
      if (index === 0) {
        return true;
      }

      return !areCoordinatesEqual(allCoordinates[index - 1], coordinate);
    });

  const coordinates = anchorCoordinates
    .flatMap((coordinate, index) => {
      if (index === anchorCoordinates.length - 1) {
        return [coordinate];
      }

      const segment = interpolateGreatCircleSegment(
        coordinate,
        anchorCoordinates[index + 1],
      );

      return index === 0 ? segment : segment.slice(1);
    })
    .filter((coordinate, index, allCoordinates) => {
      if (index === 0) {
        return true;
      }

      return !areCoordinatesNearlyEqual(allCoordinates[index - 1], coordinate);
    });

  return {
    type: "Feature",
    properties: {
      pointCount: anchorCoordinates.length,
    },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}
