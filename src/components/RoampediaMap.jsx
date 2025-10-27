import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { motion } from "framer-motion";
import "./RoampediaMap.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic3JpamFuYW5pMjA3MyIsImEiOiJjbWg4emNwcWQxNHdsMmlzNWU1OHgxa2xkIn0.2M6rf1vKlgeWShhOhqI-OQ";

export default function RoampediaMap({ userId = "user_123" }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [visited, setVisited] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [journeyMode, setJourneyMode] = useState(true);

  // 🗺️ Fetch visited countries for user
  useEffect(() => {
    async function fetchVisited() {
      try {
        const res = await axios.get(`/api/user_journey/${userId}`);
        setVisited(res.data.places_visited?.map((p) => p.cca3) || []);
      } catch (e) {
        console.warn("Fetch visited failed:", e);
      }
    }
    fetchVisited();
  }, [userId]);

  // 🌍 Initialize Mapbox map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 1.3,
        projection: "globe",
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      mapRef.current.on("style.load", async () => {
        mapRef.current.setFog({});

        // Load country polygons
        mapRef.current.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        // Default country layer (light grey)
        mapRef.current.addLayer({
          id: "country-borders",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": journeyMode ? "#e5e7eb" : "#d1d5db",
            "fill-opacity": 0.7,
          },
        });

        // Highlight visited countries
        mapRef.current.addLayer({
          id: "visited-countries",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "#60a5fa",
            "fill-opacity": 0.8,
          },
          filter: ["in", "iso_3166_1_alpha_3", ...visited],
        });

        // Borders
        mapRef.current.addLayer({
          id: "country-outline",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.6,
          },
        });

        // Hover event
        mapRef.current.on("mousemove", "country-borders", (e) => {
          if (e.features.length > 0) {
            const f = e.features[0];
            setHoverInfo({
              name: f.properties.name_en,
              code: f.properties.iso_3166_1_alpha_3,
              x: e.point.x,
              y: e.point.y,
            });
          }
        });

        mapRef.current.on("mouseleave", "country-borders", () => {
          setHoverInfo(null);
        });

        // Click event to open info drawer
        mapRef.current.on("click", "country-borders", async (e) => {
          const f = e.features[0];
          const code = f.properties.iso_3166_1_alpha_3;
          try {
            const resp = await axios.get(`/api/country/${code}`);
            setSelectedCountry({
              code,
              ...resp.data,
            });
            console.log("Country API response:", resp.data);

          } catch (err) {
            console.warn("Country fetch failed:", err);
          }
        });
      });
    }

    // Update visited countries on map
    if (mapRef.current?.getLayer("visited-countries")) {
      mapRef.current.setFilter("visited-countries", [
        "in",
        "iso_3166_1_alpha_3",
        ...visited,
      ]);
    }
  }, [visited, journeyMode]);

  // ✈️ Add country to journey
  async function handleAddToJourney() {
    if (!selectedCountry) return;
    const basic = selectedCountry.basic;
    try {
      await axios.post("/api/user_journey", {
        userId,
        place: {
          cca3: basic.cca3,
          name: basic.name,
        },
      });
      setVisited((prev) => [...prev, basic.cca3]);
      setSelectedCountry(null);
      alert(`${basic.name} added to your Journey!`);
    } catch (e) {
      console.warn("Add journey failed:", e);
    }
  }

  return (
    <div className="roampedia-container">
      {/* Header */}
      <div className="topbar">
        <h1 className="logo">🌍 Roampedia</h1>
        <div className="controls">
          <label className="journey-toggle">
            Journey Mode
            <input
              type="checkbox"
              checked={journeyMode}
              onChange={(e) => setJourneyMode(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Map */}
      <div id="map" className="map-area" ref={mapContainer}></div>

      {/* Tooltip */}
      {hoverInfo && (
        <motion.div
          className="tooltip"
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <strong>{hoverInfo.name}</strong>
          <div className="code">{hoverInfo.code}</div>
        </motion.div>
      )}

      {/* Country Info Drawer */}
      {selectedCountry && (
        <motion.div
          className="drawer"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
        >
          <div className="drawer-header">
            <h2>{selectedCountry.basic.name}</h2>
            <button
              className="close-btn"
              onClick={() => setSelectedCountry(null)}
            >
              ✕
            </button>
          </div>
          <div className="drawer-body">
            <img
              src={selectedCountry.basic.flag}
              alt="flag"
              className="flag"
            />
            <p>
              <b>Capital:</b> {selectedCountry.basic.capital || "N/A"}
            </p>
            <p>
              <b>Region:</b> {selectedCountry.basic.region}
            </p>
            <p>
              <b>Population:</b>{" "}
              {selectedCountry.basic.population?.toLocaleString()}
            </p>
            <hr />
            <p>{selectedCountry.culture?.description}</p>
            <button onClick={handleAddToJourney} className="btn-add">
              Add to My Journey
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}