import mongoose from "mongoose";

const UserExperienceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest", // placeholder until login system exists
    },
    country: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    themes: {
      type: [String],
      required: true,
      validate: [
        (arr) => arr.length >= 1 && arr.length <= 2,
        "Select at least 1 and at most 2 themes.",
      ],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UserExperience = mongoose.model("UserExperience", UserExperienceSchema);

export default UserExperience;
