// src/components/RoampediaMap.jsx
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { motion } from "framer-motion";
import CountryDashboard from "./CountryDashboard/CountryDashboard";
import "./RoampediaMap.css";
import ExperienceModal from "./CountryDashboard/ExperienceModal";
import AddExperienceForm from "./CountryDashboard/AddExperienceForm";

mapboxgl.accessToken = "pk.eyJ1Ijoic3JpamFuYW5pMjA3MyIsImEiOiJjbWg4emNwcWQxNHdsMmlzNWU1OHgxa2xkIn0.2M6rf1vKlgeWShhOhqI-OQ";

export default function RoampediaMap({ userId = "user_123" }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [visited, setVisited] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [journeyMode, setJourneyMode] = useState(true);

  // 🗺️ Fetch visited countries for user (dummy API)
  useEffect(() => {
    async function fetchVisited() {
      try {
        // attempt to call server; fallback to localStorage
        const res = await axios.get(`/api/user_journey/${userId}`).catch(() => null);
        if (res?.data?.places_visited) {
          setVisited(res.data.places_visited.map((p) => p.cca3));
        } else {
          const local = JSON.parse(localStorage.getItem(`rp_visited_${userId}`) || "[]");
          setVisited(local.map((p) => p.cca3));
        }
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

        // ✅ Click event to open CountryDashboard
        mapRef.current.on("click", "country-borders", async (e) => {
          const f = e.features[0];
          const code = f.properties.iso_3166_1_alpha_3;
          try {
            const resp = await axios.get(`/api/country/${code}`).catch(() => null);
            setSelectedCountry({
              code,
              name: f.properties.name_en,
              region: f.properties.region || "",
              basic: {
                cca3: code,
                name: f.properties.name_en,
              },
            });
          } catch (err) {
            console.warn("Country fetch failed:", err);
            setSelectedCountry({
              basic: {
                cca3: code,
                name: f.properties.name_en,
                capital: "Unknown",
                region: "N/A",
                population: 0,
                flag: "",
              },
            });
          }
        });
      });
    }

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
      // If server available, post; else save locally
      await axios.post("/api/user_journey", {
        userId,
        place: {
          cca3: basic.cca3,
          name: basic.name,
        },
      }).catch(() => null);

      const existing = JSON.parse(localStorage.getItem(`rp_visited_${userId}`) || "[]");
      existing.push({ cca3: basic.cca3, name: basic.name });
      localStorage.setItem(`rp_visited_${userId}`, JSON.stringify(existing));
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

      {/* ✅ New Country Dashboard Panel */}
      {selectedCountry && (
        <CountryDashboard
          countryCode={selectedCountry.code || selectedCountry.basic?.cca3}
          countryName={selectedCountry.basic?.name || selectedCountry.name}
          onClose={() => setSelectedCountry(null)}
          cacheTTL={1000 * 60 * 15}
        />
      )}
    </div>
  );
}
