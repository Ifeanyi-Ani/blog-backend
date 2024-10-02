const express = require("express");
const router = express.Router();

const {
  updateUser,
  deleteUser,
  getUser,
  getAllUser,
  updateMe,
  followers,
} = require("../controllers/userController");

const { protect, restrictTo } = require("../controllers/authController");

router.get("/", getAllUser);
router.patch("/updateMe", protect, updateMe);

router
  .route("/:id")
  .patch(protect, updateUser)
  .delete(protect, restrictTo("admin"), deleteUser)
  .get(protect, getUser);

router.put("/:id/followers", followers);

module.exports = router;
