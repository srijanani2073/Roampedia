import mongoose from "mongoose";

const travelNoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  countryName: { type: String, required: true },
  countryCode: { type: String, required: true },
  notes: { type: String, default: "" },
  priority: { type: String, default: "" },
  flagUrl: { type: String },
  region: { type: String },
}, { timestamps: true });

const TravelNote = mongoose.model("TravelNote", travelNoteSchema);
export default TravelNote;
