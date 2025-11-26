const Reel = require("../models/Reel");
const User = require("../models/User");

// Create a new reel
exports.createReel = async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption, hashtags, music } = req.body;
    const userId = req.user.id;

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Media URL is required",
      });
    }

    const newReel = new Reel({
      user: userId,
      mediaUrl,
      mediaType: mediaType || "video",
      caption: caption || "",
      hashtags: hashtags || [],
      music: music || {},
    });

    await newReel.save();

    // Populate user details
    await newReel.populate("user", "fullName username profileImage");

    res.status(201).json({
      success: true,
      message: "Reel created successfully",
      reel: newReel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all reels (feed)
exports.getReels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName username profileImage")
      .select("-likes -comments -shares");

    const total = await Reel.countDocuments({ isActive: true });

    res.json({
      success: true,
      count: reels.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get reel by ID
exports.getReelById = async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId)
      .populate("user", "fullName username profileImage")
      .populate("comments.user", "fullName username profileImage");

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    // Increment views
    reel.views += 1;
    await reel.save();

    res.json({
      success: true,
      reel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user's reels
exports.getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName username profileImage")
      .select("-likes -comments -shares");

    const total = await Reel.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      count: reels.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Like/Unlike a reel
exports.likeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    const alreadyLiked = reel.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      reel.likes = reel.likes.filter((id) => id.toString() !== userId);
      reel.likesCount = Math.max(0, reel.likesCount - 1);
      await reel.save();

      res.json({
        success: true,
        message: "Reel unliked",
        action: "unliked",
        likesCount: reel.likesCount,
      });
    } else {
      // Like
      reel.likes.push(userId);
      reel.likesCount += 1;
      await reel.save();

      res.json({
        success: true,
        message: "Reel liked",
        action: "liked",
        likesCount: reel.likesCount,
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

// Comment on a reel
exports.commentOnReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    const comment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    reel.comments.push(comment);
    reel.commentsCount += 1;
    await reel.save();

    // Populate the new comment's user details
    await reel.populate("comments.user", "fullName username profileImage");

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: reel.comments[reel.comments.length - 1],
      commentsCount: reel.commentsCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get comments for a reel
exports.getReelComments = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reel = await Reel.findById(reelId)
      .populate("comments.user", "fullName username profileImage")
      .select("comments commentsCount");

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    // Sort comments by newest first and paginate
    const comments = reel.comments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      count: comments.length,
      total: reel.commentsCount,
      page: parseInt(page),
      totalPages: Math.ceil(reel.commentsCount / limit),
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Share a reel
exports.shareReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    // Check if already shared
    if (!reel.shares.includes(userId)) {
      reel.shares.push(userId);
      reel.sharesCount += 1;
      await reel.save();
    }

    res.json({
      success: true,
      message: "Reel shared",
      sharesCount: reel.sharesCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a reel (soft delete)
exports.deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    // Check if user owns the reel
    if (reel.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this reel",
      });
    }

    reel.isActive = false;
    await reel.save();

    res.json({
      success: true,
      message: "Reel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Search reels by hashtag
exports.searchReelsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!hashtag) {
      return res.status(400).json({
        success: false,
        message: "Hashtag is required",
      });
    }

    const reels = await Reel.find({
      hashtags: { $in: [hashtag] },
      isActive: true,
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName username profileImage")
      .select("-likes -comments -shares");

    const total = await Reel.countDocuments({
      hashtags: { $in: [hashtag] },
      isActive: true,
    });

    res.json({
      success: true,
      count: reels.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get trending reels
exports.getTrendingReels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get reels from last 7 days, sorted by likes and views
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reels = await Reel.find({
      isActive: true,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ likesCount: -1, views: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName username profileImage")
      .select("-likes -comments -shares");

    const total = await Reel.countDocuments({
      isActive: true,
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      success: true,
      count: reels.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      reels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
