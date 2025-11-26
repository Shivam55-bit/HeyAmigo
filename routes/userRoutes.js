const express = require("express");
const router = express.Router();
const { getUserById, getUserProfile, updateProfile, followUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/id/:id", getUserById); // public route - get user by ID
router.get("/:username", getUserProfile); // public route - get user by username
router.put("/:id", verifyToken, updateProfile); // protected
router.post("/follow/:id", verifyToken, followUser); // protected

module.exports = router;
