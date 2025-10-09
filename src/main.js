import mapboxgl from "mapbox-gl";
import { createIcons, icons } from "lucide";
import "mapbox-gl/dist/mapbox-gl.css";
import { initDownloadButton } from "@modules/download.js";
import { initHelpModal } from "@modules/help.js";
import "@ui/style.css";

createIcons({ icons });

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_API_TOKEN;
const markerBtn = document.getElementById("marker");
const helpBtn = document.getElementById("help");
const myLocationBtn = document.getElementById("my-location");
const coordinatesView = document.getElementById("coordinates");
const lineBtn = document.getElementById("line");
const polygonBtn = document.getElementById("polygon");
const downloadBtn = document.getElementById("download");
const helpModal = document.getElementById("help-modal");
const closeModalBtn = document.getElementById("close-modal");

const result = document.createElement("p");
result.className = "px-1.5 py-1 rounded-sm mt-1";
coordinatesView.appendChild(result);

let markerArr = [];
let lineCoordinates = [];
let polygonCoordinates = [];
let mode = "none";
let activeButton = null;

// ==================================================
function activate(btn, newMode) {
  activeButton = btn;
  mode = newMode;
  console.log("Mode changed to:", newMode);
}

// ===================================================
const map = new mapboxgl.Map({
  container: "map",
  accessToken: MAPBOX_ACCESS_TOKEN,
  center: [69.25139186932475, 41.31633172679204],
  zoom: 7,
  hash: true,
  boxZoom: true,
  style: "mapbox://styles/mapbox/dark-v10",
  attributionControl: false,
});

map.on("load", () => {
  // ============ LINE ==============
  map.addSource("lineLayer", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [] },
    },
  });

  map.addLayer({
    id: "lineLayer",
    source: "lineLayer",
    type: "line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#00ffea", "line-width": 3 },
  });

  map.addSource("linePoints", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "linePoints",
    source: "linePoints",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-color": "#ff0000",
      "circle-stroke-color": "#fff",
      "circle-stroke-width": 1,
    },
  });

  // ============ POLYGON ==============
  map.addSource("polygonLayer", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[]] },
    },
  });

  map.addLayer({
    id: "polygonLayer",
    type: "fill",
    source: "polygonLayer",
    layout: {},
    paint: {
      "fill-color": "#00ff80",
      "fill-opacity": 0.5,
    },
  });

  map.addLayer({
    id: "outline",
    type: "line",
    source: "polygonLayer",
    layout: {},
    paint: {
      "line-color": "#00ffea",
      "line-width": 3,
    },
  });

  // ================= BUTTON MODES =================
  markerBtn.onclick = () => activate(markerBtn, "marker");
  lineBtn.onclick = () => activate(lineBtn, "line");
  polygonBtn.onclick = () => activate(polygonBtn, "polygon");
  initHelpModal(helpBtn, helpModal);

  // ================= MAP CLICK ====================
  map.on("click", (e) => {
    const { lng, lat } = e.lngLat;

    // MARKER
    if (mode === "marker") {
      const marker = new mapboxgl.Marker({ color: "#fa1f0f", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      result.textContent = `[ ${lng.toFixed(6)}, ${lat.toFixed(6)} ]`;
      markerArr.push(marker);
    }

    // LINE
    if (mode === "line") {
      lineCoordinates.push([lng, lat]);
      map.getSource("lineLayer").setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: lineCoordinates },
      });

      const pointFeatures = lineCoordinates.map((coord) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: coord },
      }));
      map.getSource("linePoints").setData({
        type: "FeatureCollection",
        features: pointFeatures,
      });

      result.textContent = `[ ${lng.toFixed(6)}, ${lat.toFixed(6)} ]`;
    }

    // POLYGON
    if (mode === "polygon") {
      polygonCoordinates.push([lng, lat]);
      map.getSource("polygonLayer").setData({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [polygonCoordinates],
        },
      });

      result.textContent = `[ ${lng.toFixed(6)}, ${lat.toFixed(6)} ]`;
    }
  });

  // ================= MY LOCATION ===================
  myLocationBtn.onclick = () => {
    activate(myLocationBtn, "my-location");
    navigator.geolocation.getCurrentPosition(onSucces, onError);

    function onSucces(position) {
      const { latitude, longitude } = position.coords;

      const myLocationData = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [longitude, latitude] },
      };

      if (map.getSource("myLocationData")) {
        map.getSource("myLocationData").setData(myLocationData);
      } else {
        map.addSource("myLocationData", {
          type: "geojson",
          data: myLocationData,
        });

        map.addLayer({
          id: "myLocationData",
          type: "circle",
          source: "myLocationData",
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-color": "#fa1f0f",
            "circle-stroke-color": "#fff",
          },
        });
      }

      result.textContent = `[ ${longitude.toFixed(6)}, ${latitude.toFixed(6)} ]`;
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true,
      });
    }

    function onError(error) {
      console.error(error);
    }
  };

  // ================= DOWNLOAD ===================
  initDownloadButton(
    downloadBtn,
    markerArr,
    lineCoordinates,
    polygonCoordinates,
  );
});
