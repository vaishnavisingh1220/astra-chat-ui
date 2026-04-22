import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{ _id: true } // ✅ Enable _id for messages
);

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId, // 🔥 REQUIRED for auth-based chats
      required: true,
      index: true, // 🚀 faster queries
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat ||
  mongoose.model("Chat", ChatSchema);