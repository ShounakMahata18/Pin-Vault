import mongoose from "mongoose";

const PinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled",
      trim: true,
    },
    screenshot: {
      type: String,
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

PinSchema.index({ userId: 1, savedAt: -1 });
PinSchema.index({ userId: 1, domain: 1, savedAt: -1 });

const Pin = mongoose.model("Pin", PinSchema);
export default Pin;
