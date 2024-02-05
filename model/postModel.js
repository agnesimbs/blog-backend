const mongoose = require("mongoose");
const postSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Agriculture",
        "Business",
        "Education",
        "Entertainment",
        "Art",
        "Uncategorized",
      ],
      message: "{Value is not supported",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Post", postSchema);
