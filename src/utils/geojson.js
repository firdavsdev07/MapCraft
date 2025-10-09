export function createGeoJSON(markerArr, lineCoordinates, polygonCoordinates) {
  const markerFeatures = markerArr.map((marker) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: marker.getLngLat().toArray(),
    },
    properties: {},
  }));

  const lineFeature =
    lineCoordinates.length > 0
      ? [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: lineCoordinates },
            properties: {},
          },
        ]
      : [];

  const polygonFeature =
    polygonCoordinates.length > 0
      ? [
          {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [polygonCoordinates] },
            properties: {},
          },
        ]
      : [];

  return {
    type: "FeatureCollection",
    features: [...markerFeatures, ...lineFeature, ...polygonFeature],
  };
}
