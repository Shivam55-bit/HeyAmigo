const User = require("../models/User");

// Get user profile by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("fullName username email number profileImage createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get user profile by username
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, phone, profileImage },
      { new: true }
    ).select("-password");
    res.json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Follow / Unfollow user
exports.followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (currentUser.following.includes(targetUser._id)) {
      // Unfollow
      await currentUser.updateOne({ $pull: { following: targetUser._id } });
      await targetUser.updateOne({ $pull: { followers: currentUser._id } });
      res.json({ success: true, message: "Unfollowed user" });
    } else {
      // Follow
      await currentUser.updateOne({ $push: { following: targetUser._id } });
      await targetUser.updateOne({ $push: { followers: currentUser._id } });
      res.json({ success: true, message: "Followed user" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
