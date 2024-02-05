const express = require("express");
const router = express.Router();
const {
  createPost,
  getSinglePost,
  getAllPosts,
  editPost,
  getCategoryPosts,
  getUserPosts,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/createPost", authMiddleware, createPost);
router.get("/:id", getSinglePost);
router.get("/", getAllPosts);
router.get("/categories/:category", getCategoryPosts);
router.get("/users/:id", getUserPosts);
router.patch("/:id", authMiddleware, editPost);
router.put("/:id", authMiddleware, deletePost);

module.exports = router;
