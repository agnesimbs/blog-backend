const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  getUser,
  editUser,
  loginUser,
  changeAvator,
  getAuthors,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post("/change-avator", authMiddleware, changeAvator);
router.patch("/edit-user", authMiddleware, editUser);

module.exports = router;
