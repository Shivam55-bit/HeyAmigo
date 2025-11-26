const express = require("express");
const router = express.Router();
const {
  createReel,
  getReels,
  getReelById,
  getUserReels,
  likeReel,
  commentOnReel,
  getReelComments,
  shareReel,
  deleteReel,
  searchReelsByHashtag,
  getTrendingReels,
} = require("../controllers/reelController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getReels); // Get all reels feed
router.get("/trending", getTrendingReels); // Get trending reels
router.get("/search", searchReelsByHashtag); // Search by hashtag
router.get("/:reelId", getReelById); // Get single reel
router.get("/user/:userId", getUserReels); // Get user's reels
router.get("/:reelId/comments", getReelComments); // Get reel comments

// Protected routes (require authentication)
router.post("/", verifyToken, createReel); // Create reel
router.post("/:reelId/like", verifyToken, likeReel); // Like/unlike reel
router.post("/:reelId/comment", verifyToken, commentOnReel); // Comment on reel
router.post("/:reelId/share", verifyToken, shareReel); // Share reel
router.delete("/:reelId", verifyToken, deleteReel); // Delete reel

module.exports = router;
