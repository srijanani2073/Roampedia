import mongoose from "mongoose";

const TravelThemeSchema = new mongoose.Schema({
  themeId: { type: String, required: true, unique: true },
  themeName: { type: String, required: true },
  description: { type: String },
  icon: { type: String }
});

export default mongoose.model("TravelTheme", TravelThemeSchema);
