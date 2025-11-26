// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { registerUser, loginUser } = require("../controllers/authController");

// 🖼️ Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // saves in uploads/
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// ✅ Signup (with profile image)
router.post("/signup", upload.single("profileImage"), registerUser);

// ✅ Login
router.post("/login", loginUser);

module.exports = router;
