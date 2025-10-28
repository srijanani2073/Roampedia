import React, { useEffect, useState } from "react";
import axios from "axios";

const TravelListManager = ({ country, userId = "guest" }) => {
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5050/api/travelnotes";

  useEffect(() => {
    if (!country) return;
    fetchExistingNote();
  }, [country]);

  const fetchExistingNote = async () => {
    try {
      const res = await axios.get(`${API_URL}?userId=${userId}`);
      const entry = res.data.find(n => n.countryCode === country.cca2);

      if (entry) {
        setNotes(entry.notes || "");
        setPriority(entry.priority || "");
        setExistingId(entry._id);
      } else {
        setNotes("");
        setPriority("");
        setExistingId(null);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!country) return;
    setSaving(true);

    const payload = {
      userId,
      countryName: country.name,
      countryCode: country.cca2,
      notes,
      priority,
      flagUrl: country.flags?.svg || "",
      region: country.region || "",
    };

    try {
      if (existingId) {
        await axios.put(`${API_URL}/${existingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      await fetchExistingNote();
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    try {
      await axios.delete(`${API_URL}/${existingId}`);
      setNotes("");
      setPriority("");
      setExistingId(null);
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (!country) return null;
  if (loading) return <p>Loading note...</p>;

  return (
    <div className="note-card single-country">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={`Write notes about ${country.name.common}...`}
      />

      <div className="priority-row">
        <label>Priority:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
      </div>

      <div className="buttons">
        <button className="save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : existingId ? "Update" : "Save"}
        </button>
        {existingId && (
          <button className="delete" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TravelListManager;
