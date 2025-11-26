// controllers/postController.js
const Post = require("../models/Post");
const User = require("../models/User");

// ✅ Create a new post
exports.createPost = async (req, res) => {
  try {
    const { userId, text, image } = req.body;
    const newPost = new Post({ user: userId, text, image });
    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// 🧾 Get all posts (feed)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ❤️ Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// 💬 Comment on a post
exports.addComment = async (req, res) => {
  try {
    const { postId, userId, text } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
