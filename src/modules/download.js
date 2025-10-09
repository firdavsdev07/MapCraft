import { createGeoJSON } from "@utils/geojson.js";

export function initDownloadButton(
  downloadBtn,
  markerArr,
  lineCoordinates,
  polygonCoordinates,
) {
  downloadBtn.onclick = () => {
    if (
      markerArr.length === 0 &&
      lineCoordinates.length === 0 &&
      polygonCoordinates.length === 0
    )
      return;
    const data = createGeoJSON(markerArr, lineCoordinates, polygonCoordinates);

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "map-craft.geojson";
    link.click();
    URL.revokeObjectURL(url);
  };
}
