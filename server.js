// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ✅ Middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);

const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const connectRoutes = require("./routes/connectRoutes");
app.use("/api/connect", connectRoutes);

const reelRoutes = require("./routes/reelRoutes");
app.use("/api/reels", reelRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🌎 HeyAmigo Backend API is running smoothly 🚀");
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HeyAmigo backend running on http://localhost:${PORT}`);
});
