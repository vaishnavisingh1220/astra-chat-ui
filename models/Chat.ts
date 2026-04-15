import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  createdAt: Date,
});

const ChatSchema = new mongoose.Schema(
  {
    title: String,
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);