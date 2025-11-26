// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Create a post
router.post("/create", postController.createPost);

// Get all posts
router.get("/all", postController.getAllPosts);

// Like or unlike a post
router.post("/like", postController.toggleLike);

// Add a comment
router.post("/comment", postController.addComment);

module.exports = router;
