const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true, // Video or image URL
    },
    mediaType: {
      type: String,
      enum: ["video", "image"],
      default: "video",
    },
    caption: {
      type: String,
      default: "",
      maxlength: 2200,
    },
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],
    music: {
      trackName: { type: String, default: "" },
      artist: { type: String, default: "" },
      audioUrl: { type: String, default: "" },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sharesCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ likesCount: -1 });
reelSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Reel", reelSchema);
