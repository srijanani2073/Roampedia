import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { FaCheck, FaStar } from "react-icons/fa";

import WeatherCard from "./WeatherCard";
import NewsFeed from "./NewsFeed";
import TriviaCard from "./TriviaCard";
import CurrencyConverter from "./CurrencyConverter";
import TemperatureChart from "./TemperatureChart";
import TravelInsights from "./TravelInsights";
import BestTimeToVisit from "./BestTimeToVisit";
import TravelListManager from "./TravelListManager";

import { useNavigate } from "react-router-dom";

import "./CountryDashboard.css";
import "leaflet/dist/leaflet.css";

/**
 * Right-side drawer Country Dashboard (interactive mini-map using Leaflet)
 *
 * Props:
 * - countryCode (ISO alpha-3) required
 * - countryName (optional)
 * - onClose() required
 * - cacheTTL (ms) optional: default 15 minutes
 *
 * Changes in this version:
 * - Wired up Visited / Wishlist actions to call a backend API (API_BASE).
 * - Added effect to sync state with server-side lists on mount / country change.
 * - Kept in-memory cache & UI behavior intact so frontend works even if backend is missing.
 */

// Backend API to be implemented separately (Express + MongoDB).
const API_BASE = "http://localhost:5050/api"; // <-- change to your deployed server when ready
const USER_ID = "guest"; // temporary user identifier for now

export default function CountryDashboard({
  countryCode,
  countryName,
  onClose,
  cacheTTL = 1000 * 60 * 15,
}) {
  const NEWSDATA_API_KEY = "pub_9eeba8abf7fc48a681df8f921c969433";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [timezone, setTimezone] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [wikiSummary, setWikiSummary] = useState(null);
  const [wikidataFacts, setWikidataFacts] = useState(null);
  const [localTime, setLocalTime] = useState(null);
  const [accentColor, setAccentColor] = useState("#4A90E2");
  const navigate = useNavigate();

  // per-country in-memory status for session-only persistence
  const [countryStatus, setCountryStatus] = useState({});
  const [isVisited, setIsVisited] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // In-memory cache
  const [cache, setCache] = useState({});
  const clockRef = useRef(null);

  // Cache helpers
  const keyPrefix = `roampedia_${countryCode || "nocode"}`;

  const setCacheValue = (suffix, payload, ttl = cacheTTL) => {
    const key = `${keyPrefix}_${suffix}`;
    setCache((prev) => ({
      ...prev,
      [key]: { ts: Date.now(), ttl, payload },
    }));
  };

  const getCacheValue = (suffix) => {
    const key = `${keyPrefix}_${suffix}`;
    const cached = cache[key];
    if (!cached) return null;
    if (Date.now() - cached.ts > (cached.ttl || cacheTTL)) {
      setCache((prev) => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      return null;
    }
    return cached.payload;
  };

  useEffect(() => {
    if (!countryCode) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        // 1) REST Countries
        let rest = getCacheValue("rest");
        if (!rest) {
          const rr = await axios.get(
            `https://restcountries.com/v3.1/alpha/${countryCode}`
          );
          rest = rr.data?.[0];
          setCacheValue("rest", rest, 1000 * 60 * 60 * 24);
        }
        if (!rest) throw new Error("Country info unavailable");

        const normalized = {
          name: rest.name?.common || countryName || countryCode,
          cca2: rest.cca2,
          cca3: rest.cca3,
          capital: Array.isArray(rest.capital)
            ? rest.capital[0]
            : rest.capital || "",
          latlng:
            rest.capitalInfo?.latlng?.length ? rest.capitalInfo.latlng : rest.latlng || [],
          population: rest.population || 0,
          region: rest.region || "",
          flag: rest.flags?.svg || rest.flags?.png || "",
          currencies: rest.currencies || {},
          languages: rest.languages ? Object.values(rest.languages) : [],
          timezones: rest.timezones || [],
        };
        normalized.currencyCode = Object.keys(normalized.currencies || {})[0] || "USD";
        normalized.currencySymbol =
          normalized.currencies?.[normalized.currencyCode]?.symbol || "";

        if (mounted) setCountry(normalized);

        // Accent color from flag
        extractAccentFromFlag(normalized.flag).then((color) => {
          if (mounted && color) setAccentColor(color);
        });

        // 2) Weather
        let w = getCacheValue("weather");
        if (!w && normalized.latlng?.length) {
          const [lat, lon] = normalized.latlng;
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=UTC`;
          const wresp = await axios.get(weatherUrl);
          w = wresp.data;
          setCacheValue("weather", w, 1000 * 60 * 30);
        }
        if (mounted) setWeather(w);

        // 3) Timezone
        let tz = getCacheValue("timezone");
        if (!tz && normalized.latlng?.length) {
          try {
            const [lat, lon] = normalized.latlng;
            const tzUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=P1AEFU4GTZEQ&format=json&by=position&lat=${lat}&lng=${lon}`;
            const tzRes = await axios.get(tzUrl);

            if (tzRes.data.status === "OK") {
              const tzData = tzRes.data;
              tz = {
                timezone: tzData.zoneName,
                utc_offset: formatOffset(tzData.gmtOffset),
                datetime: new Date(tzData.timestamp * 1000).toISOString(),
                timestamp: tzData.timestamp,
                gmtOffset: tzData.gmtOffset,
                abbreviation: tzData.abbreviation,
                dst: tzData.dst,
              };
              setCacheValue("timezone", tz, 1000 * 60 * 30);
            } else {
              throw new Error("TimezoneDB API error");
            }
          } catch (err) {
            console.warn("TimezoneDB API failed, using fallback", err.message);
            tz = calculateFallbackTimezone(normalized.timezones?.[0]);
          }
        } else if (!tz) {
          tz = calculateFallbackTimezone(normalized.timezones?.[0]);
        }

        if (mounted) {
          setTimezone(tz);
          startClock(tz);
        }

        // 4) News
        let newsCached = getCacheValue("news");
        if (!newsCached) {
          try {
            const alpha2 = normalized.cca2?.toLowerCase();
            const nUrl = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&country=${alpha2}&language=en`;
            const nresp = await axios.get(nUrl);
            newsCached = nresp.data?.results || [];
            setCacheValue("news", newsCached, 1000 * 60 * 30);
          } catch (ne) {
            console.warn("news fetch err", ne);
            newsCached = [];
          }
        }
        if (mounted) setNews(newsCached);

        // 5) Exchange rates
        let exCached = getCacheValue("ex");
        if (!exCached) {
          try {
            const base = normalized.currencyCode || "USD";
            const exUrl = `https://api.exchangerate.host/latest?base=${base}`;
            const exresp = await axios.get(exUrl);
            exCached = exresp.data;
            setCacheValue("ex", exCached, 1000 * 60 * 60);
          } catch (ee) {
            console.warn("exchangerate.host err", ee);
            exCached = null;
          }
        }
        if (mounted) setExchangeRates(exCached);

        // 6) Wikidata facts
        let wdCached = getCacheValue("wikidata");
        if (!wdCached) {
          try {
            const q = `
              SELECT ?capitalLabel ?inception ?officialLangLabel ?anthemLabel ?mottoLabel WHERE {
                ?country rdfs:label "${normalized.name}"@en.
                OPTIONAL { ?country wdt:P36 ?capital. }
                OPTIONAL { ?country wdt:P571 ?inception. }
                OPTIONAL { ?country wdt:P37 ?officialLang. }
                OPTIONAL { ?country wdt:P85 ?anthem. }
                OPTIONAL { ?country wdt:P1459 ?motto. }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
              } LIMIT 1
            `;
            const wdUrl = "https://query.wikidata.org/sparql";
            const r = await axios.get(wdUrl, {
              params: { query: q, format: "json" },
              headers: { Accept: "application/sparql-results+json" },
            });
            wdCached = r.data?.results?.bindings?.[0] || null;
            setCacheValue("wikidata", wdCached, 1000 * 60 * 60 * 24);
          } catch (wde) {
            console.warn("wikidata err", wde);
            wdCached = null;
          }
        }
        if (mounted) setWikidataFacts(wdCached);

        // 7) Wikipedia summary
        let wikiCached = getCacheValue("wiki");
        if (!wikiCached) {
          try {
            const page = encodeURIComponent(normalized.name);
            const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`;
            const wr = await axios.get(wikiUrl);
            wikiCached = wr.data;
            setCacheValue("wiki", wikiCached, 1000 * 60 * 60 * 24);
          } catch (we) {
            console.warn("wikipedia err", we);
            wikiCached = null;
          }
        }
        if (mounted) setWikiSummary(wikiCached);

        if (mounted) setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Failed to load");
          setLoading(false);
        }
      }
    }

    fetchAll();

    return () => {
      mounted = false;
      stopClock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // Sync visited/wishlist state from backend for the current user and country
  useEffect(() => {
    if (!countryCode) return;
    let mounted = true;

    async function fetchUserLists() {
      try {
        const [vRes, wRes] = await Promise.all([
          axios.get(`${API_BASE}/visited`, { params: { userId: USER_ID } }),
          axios.get(`${API_BASE}/wishlist`, { params: { userId: USER_ID } }),
        ]);

        const visitedList = Array.isArray(vRes.data) ? vRes.data : [];
        const wishlist = Array.isArray(wRes.data) ? wRes.data : [];

        const visitedCodes = visitedList.map((c) => c.countryCode);
        const wishlistCodes = wishlist.map((c) => c.countryCode);

        const code = (country && (country.cca3 || country.cca2)) || countryCode;
        if (mounted) {
          setIsVisited(visitedCodes.includes(code));
          setIsWishlisted(wishlistCodes.includes(code));
          // update session-only map too
          setCountryStatus((prev) => ({
            ...prev,
            [code]: { visited: visitedCodes.includes(code), wishlist: wishlistCodes.includes(code) },
          }));
        }
      } catch (err) {
        // If backend not reachable, don't break UI — keep in-memory state
        console.warn("Could not sync lists with backend:", err.message || err);
      }
    }

    fetchUserLists();

    return () => {
      mounted = false;
    };
  }, [countryCode, country]);

  const formatOffset = (offsetSeconds) => {
    const hours = Math.floor(Math.abs(offsetSeconds) / 3600);
    const minutes = Math.floor((Math.abs(offsetSeconds) % 3600) / 60);
    const sign = offsetSeconds >= 0 ? "+" : "-";
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const calculateFallbackTimezone = (timezoneStr) => {
    timezoneStr = timezoneStr || "UTC";

    const offsetMatch = timezoneStr.match(/UTC([+-]\d{1,2}(?::\d{2})?)/);
    let offsetHours = 0;
    let offsetMinutes = 0;
    let displayOffset = "+00:00";

    if (offsetMatch) {
      const offsetStr = offsetMatch[1];
      const parts = offsetStr.split(":");
      offsetHours = parseInt(parts[0], 10);
      offsetMinutes = parts[1] ? parseInt(parts[1], 10) : 0;

      const sign = offsetHours >= 0 ? "+" : "";
      const absHours = Math.abs(offsetHours);
      displayOffset = `${sign}${String(absHours).padStart(2, "0")}:${String(Math.abs(offsetMinutes)).padStart(2, "0")}`;
    } else {
      const tzOffsets = {
        "Asia/Kolkata": 5.5,
        "Asia/Tokyo": 9,
        "Asia/Dubai": 4,
        "Europe/London": 0,
        "Europe/Paris": 1,
        "Europe/Moscow": 3,
        "America/New_York": -5,
        "America/Los_Angeles": -8,
        "America/Chicago": -6,
        "Australia/Sydney": 10,
        "Pacific/Auckland": 12,
      };

      const matchedZone = Object.keys(tzOffsets).find((zone) => timezoneStr.includes(zone));
      if (matchedZone) {
        offsetHours = Math.floor(tzOffsets[matchedZone]);
        offsetMinutes = (tzOffsets[matchedZone] % 1) * 60;
        const sign = offsetHours >= 0 ? "+" : "";
        const absHours = Math.abs(offsetHours);
        displayOffset = `${sign}${String(absHours).padStart(2, "0")}:${String(Math.abs(offsetMinutes)).padStart(2, "0")}`;
      }
    }

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const totalOffsetMs = offsetHours * 3600000 + offsetMinutes * 60000 * Math.sign(offsetHours);
    const localDate = new Date(utc + totalOffsetMs);

    return {
      timezone: timezoneStr,
      utc_offset: displayOffset,
      datetime: localDate.toISOString(),
      gmtOffset: offsetHours * 3600 + offsetMinutes * 60 * Math.sign(offsetHours),
      timestamp: Math.floor(localDate.getTime() / 1000),
    };
  };

  function startClock(tz) {
    stopClock();
    if (!tz?.datetime) {
      setLocalTime(null);
      return;
    }

    const baseTime = new Date(tz.datetime);
    const startTimestamp = Date.now();

    function tick() {
      try {
        const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
        const currentTime = new Date(baseTime.getTime() + elapsedSeconds * 1000);

        const hours = String(currentTime.getUTCHours()).padStart(2, "0");
        const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
        const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

        setLocalTime(`${hours}:${minutes}:${seconds}`);
      } catch (e) {
        console.warn("tick err", e);
      }
    }

    tick();
    clockRef.current = setInterval(tick, 1000);
  }

  function stopClock() {
    if (clockRef.current) {
      clearInterval(clockRef.current);
      clockRef.current = null;
    }
  }

  const extractAccentFromFlag = async (flagUrl) => {
    if (!flagUrl) return null;
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const p = new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = rej;
      });
      img.src = flagUrl;
      await p;
      const canvas = document.createElement("canvas");
      const w = Math.min(160, img.width);
      const h = Math.min(100, img.height);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(w / 4, h / 4, Math.floor(w / 2), Math.floor(h / 2)).data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha === 0) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      if (!count) return null;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      return `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
      console.warn("accent extract failed", e);
      return null;
    }
  };

  // Leaflet marker fix
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  const statusKey = country?.cca3 || country?.cca2 || country?.name || countryCode || "nocode";

  useEffect(() => {
    if (!country) {
      setIsVisited(false);
      setIsWishlisted(false);
      return;
    }
    const s = countryStatus[statusKey];
    setIsVisited(Boolean(s?.visited));
    setIsWishlisted(Boolean(s?.wishlist));
  }, [country, countryStatus, statusKey]);

  // Toggle functions now call backend endpoints (POST/DELETE) and update UI optimistically.
  const toggleVisited = async () => {
    try {
      if (!country) return;
      const code = country.cca3 || country.cca2 || countryCode;
      const payload = {
        userId: USER_ID,
        countryCode: code,
        countryName: country.name,
        region: country.region,
        flagUrl: country.flag,
      };

      // optimistic UI update
      setIsVisited((prev) => !prev);
      setCountryStatus((prev) => {
        const cur = prev[statusKey] || { visited: false, wishlist: false };
        const next = { ...cur, visited: !cur.visited };
        return { ...prev, [statusKey]: next };
      });

      if (isVisited) {
        // currently visited -> remove
        await axios.delete(`${API_BASE}/visited/${encodeURIComponent(code)}`, { params: { userId: USER_ID } });
      } else {
        // currently not visited -> add
        await axios.post(`${API_BASE}/visited`, payload);
      }
    } catch (err) {
      // revert optimistic update on failure
      console.error("Failed to toggle visited:", err);
      setIsVisited((v) => !v);
      setCountryStatus((prev) => {
        const cur = prev[statusKey] || { visited: false, wishlist: false };
        const next = { ...cur, visited: !cur.visited };
        return { ...prev, [statusKey]: next };
      });
    }
  };

  const toggleWishlist = async () => {
    try {
      if (!country) return;
      const code = country.cca3 || country.cca2 || countryCode;
      const payload = {
        userId: USER_ID,
        countryCode: code,
        countryName: country.name,
        region: country.region,
        flagUrl: country.flag,
      };

      // optimistic UI update
      setIsWishlisted((prev) => !prev);
      setCountryStatus((prev) => {
        const cur = prev[statusKey] || { visited: false, wishlist: false };
        const next = { ...cur, wishlist: !cur.wishlist };
        return { ...prev, [statusKey]: next };
      });

      if (isWishlisted) {
        // remove from wishlist
        await axios.delete(`${API_BASE}/wishlist/${encodeURIComponent(code)}`, { params: { userId: USER_ID } });
      } else {
        // add to wishlist
        await axios.post(`${API_BASE}/wishlist`, payload);
      }
    } catch (err) {
      // revert optimistic update on failure
      console.error("Failed to toggle wishlist:", err);
      setIsWishlisted((v) => !v);
      setCountryStatus((prev) => {
        const cur = prev[statusKey] || { visited: false, wishlist: false };
        const next = { ...cur, wishlist: !cur.wishlist };
        return { ...prev, [statusKey]: next };
      });
    }
  };

  return (
    <AnimatePresence>
      {countryCode && (
        <motion.aside
          className="cd-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="cd-top">
            <div className="cd-left">
              <div className="flag-wrap" style={{ borderColor: accentColor }}>
                {country?.flag && <img src={country.flag} alt={`${country.name} flag`} />}
              </div>
              <div className="title-block">
                <h3 style={{ color: accentColor }}>{country?.name || countryName || countryCode}</h3>
                <div className="sub">
                  {country?.capital ? `${country.capital} • ${country.region}` : country?.region}
                </div>
                {timezone && (
                  <div className="timezone">
                    🕒 {timezone.timezone} (UTC{timezone.utc_offset}) — Local Time: {localTime || "—"}
                  </div>
                )}
              </div>
            </div>

            <div className="cd-actions">
              <button
                className={`icon-btn ${isVisited ? "active-visited" : ""}`}
                onClick={toggleVisited}
                title={isVisited ? "Remove from Visited" : "Mark as Visited"}
                aria-pressed={isVisited}
                aria-label={isVisited ? "Visited — selected" : "Mark as visited"}
              >
                <FaCheck />
              </button>

              <button
                className={`icon-btn ${isWishlisted ? "active-wishlist" : ""}`}
                onClick={toggleWishlist}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-pressed={isWishlisted}
                aria-label={isWishlisted ? "Wishlisted — selected" : "Add to wishlist"}
              >
                <FaStar />
              </button>

              <button className="btn" onClick={onClose} title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="cd-content">
            {loading ? (
              <div className="cd-loading">Loading…</div>
            ) : error ? (
              <div className="cd-error">{error}</div>
            ) : (
              <div className="cd-grid">
                <div className="left-col">
                  <div className="card quick-card">
                    <div className="card-body">
                      <div className="q-row">
                        <div>
                          <div className="q-label">Local time</div>
                          <div className="q-value">{localTime || "—"}</div>
                        </div>

                        <div>
                          <div className="q-label">Population</div>
                          <div className="q-value">{country?.population?.toLocaleString() || "—"}</div>
                        </div>

                        <div>
                          <div className="q-label">Currency</div>
                          <div className="q-value">
                            {country?.currencyCode || "—"} {country?.currencySymbol || ""}
                          </div>
                        </div>
                      </div>
                      <div className="q-row small-meta">
                        <div>Languages: {country?.languages?.slice(0, 3).join(", ") || "—"}</div>
                        <div>Region: {country?.region || "—"}</div>
                      </div>
                    </div>
                  </div>

                  <WeatherCard weather={weather} capital={country?.capital} />
                  <TemperatureChart weather={weather} latlng={country?.latlng} />
                  <TriviaCard wikidata={wikidataFacts} wikipedia={wikiSummary} country={country} />
                  <TravelInsights />
                </div>

                <div className="right-col">
                  <TravelListManager country={country} userId="guest" />
                  <div className="card map-card">
                    <div className="card-header">Map</div>
                    <div className="card-body map-body">
                      {country?.latlng?.length ? (
                        <div style={{ height: 220 }}>
                          <MapContainer
                            center={[country.latlng[0], country.latlng[1]]}
                            zoom={5}
                            style={{ height: "100%", width: "100%", borderRadius: 8 }}
                            scrollWheelZoom={true}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[country.latlng[0], country.latlng[1]]}>
                              <Popup>{country.name} — {country.capital}</Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      ) : (
                        <div className="muted">Map preview not available</div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <a
                          className="link"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            country?.capital || country?.name
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google Maps ↗
                        </a>
                      </div>
                    </div>
                  </div>

                  <NewsFeed articles={news} />

                  <CurrencyConverter
                    exchangeRates={exchangeRates}
                    defaultTo={country?.currencyCode}
                    defaultToSymbol={country?.currencySymbol}
                  />

                  <BestTimeToVisit
                    lat={country?.latlng?.[0]}
                    lon={country?.latlng?.[1]}
                    countryName={country?.name}
                  />

                  <div className="quiz-btn-wrap">
                    <button
                      onClick={() => navigate("/trivia")}
                      className="btn quiz-btn"
                    >
                      🎯 Take Country Quiz →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
