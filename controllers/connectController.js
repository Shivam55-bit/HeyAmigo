const User = require("../models/User");

// Get random users with gender preference
exports.getRandomUsers = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const currentUserId = req.user.id;

    // Get current user's gender
    const currentUser = await User.findById(currentUserId).select("gender");
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Determine preferred gender (opposite gender for better matching)
    let preferredGender;
    if (currentUser.gender === "male") {
      preferredGender = "female";
    } else if (currentUser.gender === "female") {
      preferredGender = "male";
    }

    let users;
    
    if (preferredGender) {
      // Get 70% opposite gender, 30% same gender (for variety)
      const oppositeCount = Math.floor(limit * 0.7);
      const sameCount = limit - oppositeCount;

      const oppositeGenderUsers = await User.aggregate([
        {
          $match: {
            _id: { $ne: currentUser._id },
            gender: preferredGender,
          },
        },
        { $sample: { size: oppositeCount } },
        {
          $project: {
            fullName: 1,
            username: 1,
            age: 1,
            gender: 1,
            bio: 1,
            profileImage: 1,
            location: 1,
            interests: 1,
          },
        },
      ]);

      const sameGenderUsers = await User.aggregate([
        {
          $match: {
            _id: { $ne: currentUser._id },
            gender: currentUser.gender,
          },
        },
        { $sample: { size: sameCount } },
        {
          $project: {
            fullName: 1,
            username: 1,
            age: 1,
            gender: 1,
            bio: 1,
            profileImage: 1,
            location: 1,
            interests: 1,
          },
        },
      ]);

      // Combine and shuffle
      users = [...oppositeGenderUsers, ...sameGenderUsers].sort(() => Math.random() - 0.5);
    } else {
      // For "other" gender, show random mix
      users = await User.aggregate([
        {
          $match: {
            _id: { $ne: currentUser._id },
          },
        },
        { $sample: { size: parseInt(limit) } },
        {
          $project: {
            fullName: 1,
            username: 1,
            age: 1,
            gender: 1,
            bio: 1,
            profileImage: 1,
            location: 1,
            interests: 1,
          },
        },
      ]);
    }

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Search users by name or interests
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Search by name, username, or interests
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { interests: { $in: [new RegExp(query, "i")] } },
      ],
    }).select("fullName username age bio profileImage location interests");

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Like/Unlike a user
exports.likeUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to like/unlike
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot like yourself",
      });
    }

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already liked
    const alreadyLiked = currentUser.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      await currentUser.updateOne({ $pull: { likes: userId } });
      await targetUser.updateOne({ $pull: { likedBy: currentUserId } });
      res.json({
        success: true,
        message: "User unliked",
        action: "unliked",
      });
    } else {
      // Like
      await currentUser.updateOne({ $push: { likes: userId } });
      await targetUser.updateOne({ $push: { likedBy: currentUserId } });

      // Check if it's a match (both liked each other)
      const isMatch = targetUser.likes.includes(currentUserId);

      res.json({
        success: true,
        message: "User liked",
        action: "liked",
        isMatch,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all matches (mutual likes)
exports.getMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId)
      .populate("likes", "fullName username profileImage age location bio interests")
      .select("likes likedBy");

    // Filter for mutual likes (matches)
    const matches = currentUser.likes.filter((likedUser) =>
      currentUser.likedBy.some((likerId) => likerId.equals(likedUser._id))
    );

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get users who liked me
exports.getLikedByUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId).populate(
      "likedBy",
      "fullName username profileImage age location bio interests"
    );

    res.json({
      success: true,
      count: currentUser.likedBy.length,
      users: currentUser.likedBy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
