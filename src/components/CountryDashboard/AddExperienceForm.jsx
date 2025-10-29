import React, { useState, useEffect } from "react";
import axios from "axios";

const AddExperienceForm = ({ selectedCountry, onClose }) => {
  const [countryName, setCountryName] = useState(selectedCountry || "");
  const [experience, setExperience] = useState("");
  const [themes, setThemes] = useState([]);
  const [rating, setRating] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingExperiences, setExistingExperiences] = useState([]); // ✅ For READ operation

  const maxThemes = 2;

  const availableThemes = [
    "Cultural Exploration",
    "Adventure & Trekking",
    "Food & Cuisine",
    "Historical & Heritage",
    "Nature & Wildlife",
    "Festivals & Events",
    "Urban Life & Nightlife",
    "Beach & Relaxation",
  ];

  // ✅ Sync selected country
  useEffect(() => {
    setCountryName(selectedCountry || "");
  }, [selectedCountry]);

  // ✅ Fetch existing experiences (READ)
  useEffect(() => {
    const fetchExperiences = async () => {
      if (!countryName) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5050/api/experiences?country=${countryName}`
        );
        setExistingExperiences(res.data);
      } catch (err) {
        console.error("❌ Error fetching experiences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [countryName]);

  const handleThemeSelect = (theme) => {
    if (themes.includes(theme)) {
      setThemes(themes.filter((t) => t !== theme));
    } else if (themes.length < maxThemes) {
      setThemes([...themes, theme]);
    } else {
      alert("You can select at most 2 themes.");
    }
  };

  const getRatingEmoji = (val) => {
    if (val <= 3) return "😕";
    if (val <= 6) return "🙂";
    if (val <= 8) return "😄";
    return "🤩";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({ countryName, experience, themes, rating, fromDate, toDate });

    if (!countryName) {
      alert("Country name is missing — please reselect the country.");
      return;
    }
    if (themes.length === 0) {
      alert("Please select at least one theme.");
      return;
    }

    setSaving(true);

    try {
      await axios.post("http://localhost:5050/api/experiences/add", {
        userId: "guest", // temporary
        country: countryName,
        experience,
        themes,
        rating,
        fromDate,
        toDate,
      });

      alert("Experience saved successfully!");
      setExperience("");
      setThemes([]);
      setRating(5);
      setFromDate("");
      setToDate("");

      // ✅ Refresh after saving
      const res = await axios.get(
        `http://localhost:5050/api/experiences?country=${countryName}`
      );
      setExistingExperiences(res.data);

    } catch (err) {
      console.error("❌ Error saving experience:", err);
      alert("Failed to save experience. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-experience-form">
      <h3>Share Your Experience in {countryName || "this country"}</h3>

      {/* ✅ Existing Experiences */}
      {loading ? (
        <p>Loading past experiences...</p>
      ) : existingExperiences.length > 0 ? (
        <div className="existing-experiences">
          <h4>Previous Experiences</h4>
          {existingExperiences.map((exp) => (
            <div key={exp._id} className="experience-card">
              <p><strong>Notes:</strong> {exp.experience}</p>
              <p><strong>Themes:</strong> {exp.themes.join(", ")}</p>
              <p><strong>Rating:</strong> {exp.rating}/10</p>
              <p><strong>Stay:</strong> {exp.fromDate} → {exp.toDate}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No previous experiences yet.</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Notes Box */}
        <label>Experience Notes</label>
        <textarea
          placeholder="Describe your experience..."
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
        />

        {/* Themes Checklist */}
        <label>Travel Themes (Pick up to 2)</label>
        <div className="themes-list">
          {availableThemes.map((theme) => (
            <div
              key={theme}
              className={`theme-item ${
                themes.includes(theme) ? "selected" : ""
              }`}
              onClick={() => handleThemeSelect(theme)}
            >
              {theme}
            </div>
          ))}
        </div>

        {/* Rating */}
        <label>Rate Your Visit ({rating}/10) {getRatingEmoji(rating)}</label>
        <input
          type="range"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="rating-slider"
        />

        {/* Stay Duration */}
        <div className="date-range">
          <div>
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Experience"}
        </button>
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddExperienceForm;
