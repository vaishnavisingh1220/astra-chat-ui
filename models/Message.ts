import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  role: {
    type: String, // "user" | "assistant"
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);