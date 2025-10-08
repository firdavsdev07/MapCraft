import mapboxgl from "mapbox-gl";
import { createIcons, icons } from "lucide";
import "mapbox-gl/dist/mapbox-gl.css";
import "@ui/style.css";

createIcons({ icons });

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_API_TOKEN;
const markerBtn = document.getElementById("marker");
const helpBtn = document.getElementById("help");
const myLocationBtn = document.getElementById("my-location");
const coordinatesView = document.getElementById("coordinates");
const lineBtn = document.getElementById("line");

const result = document.createElement("p");
result.className = "px-1.5 py-1 rounded-sm mt-1";
coordinatesView.appendChild(result);

let markerArr = [];
let lineCoordinates = [];
let mode = "none";
let activeButton = null;

// ==================================================
function activate(btn, newMode) {
  activeButton = btn;
  mode = newMode;
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
  map.addSource("lineLayerId", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    },
  });

  map.addLayer({
    id: "lineLayerId",
    source: "lineLayerId",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#00ffea",
      "line-width": 3,
    },
  });
  markerBtn.onclick = () => activate(markerBtn, "marker");
  map.on("click", (e) => {
    const { lng, lat } = e.lngLat;
    // marker yaratish
    if (mode === "marker") {
      const marker = new mapboxgl.Marker({
        color: "#fa1f0f",
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Faqat matnni yangilaymiz, yangi <p> yaratmaymiz
      result.textContent = `[ ${lng.toFixed(6)}, ${lat.toFixed(6)} ]`;
      markerArr.push(marker);
    }

    //line chizish uchun
    lineBtn.onclick = () => activate(lineBtn, "line");
    if (mode === "line") {
      lineCoordinates.push([lng, lat]);
      map.getSource("lineLayerId").setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: lineCoordinates,
        },
      });
      result.textContent = `[ ${lng.toFixed(6)}, ${lat.toFixed(6)} ]`;
    }
  });
  // o'z joyini aniqlash
  myLocationBtn.onclick = () => {
    activate(myLocationBtn, "my-location");
    navigator.geolocation.getCurrentPosition(onSucces, onError);

    function onSucces(position) {
      const { latitude, longitude } = position.coords;

      const myLocationData = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      };

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

      // faqat mavjud <p> matnini yangilaymiz
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
});

helpBtn.onclick = () => activate(helpBtn, "help");
