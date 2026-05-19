import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: userObj,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔹 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔹 OAuth exchange: create or find user from provider profile and return app JWT
export const oauthExchange = async (req, res) => {
  try {
    const { email, name, image, provider } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a lightweight user record. Password not required for OAuth users.
      user = await User.create({ name: name || "", email, password: "" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({ success: true, token, user: userObj });
  } catch (err) {
    console.error("OAUTH EXCHANGE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};