import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️  No MONGO_URI provided for Chat Service — skipping DB connect (development mode)");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Chat DB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;