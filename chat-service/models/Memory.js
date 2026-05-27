import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    threadId: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Memory",
  memorySchema
);