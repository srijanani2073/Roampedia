import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    countryCode: { type: String, required: true },
    countryName: { type: String },
    region: { type: String },
    flagUrl: { type: String },
    addedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, countryCode: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
