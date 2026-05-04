import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Thread", ThreadSchema);