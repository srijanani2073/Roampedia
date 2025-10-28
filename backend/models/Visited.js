import mongoose from "mongoose";

const visitedSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    countryCode: { type: String, required: true },
    countryName: { type: String },
    region: { type: String },
    flagUrl: { type: String },
    dateVisited: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

visitedSchema.index({ userId: 1, countryCode: 1 }, { unique: true });

const Visited = mongoose.model("Visited", visitedSchema);
export default Visited;
