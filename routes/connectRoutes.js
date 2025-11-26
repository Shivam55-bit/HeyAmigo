const express = require("express");
const router = express.Router();
const {
  getRandomUsers,
  searchUsers,
  likeUser,
  getMatches,
  getLikedByUsers,
} = require("../controllers/connectController");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes require authentication
router.get("/random", verifyToken, getRandomUsers);
router.get("/search", verifyToken, searchUsers);
router.post("/like/:userId", verifyToken, likeUser);
router.get("/matches", verifyToken, getMatches);
router.get("/liked-by", verifyToken, getLikedByUsers);

module.exports = router;
