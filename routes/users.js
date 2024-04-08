const express = require("express");
const router = express.Router();
const { json } = require("express");

const {
  uploadUserPhoto,
  updateUser,
  deleteUser,
  getUser,
  getAllUser,
} = require("../controllers/userController");
const { protect } = require("../controllers/authController");

// router.patch('/updateMe', authController.protect, userController.updateMe)
//update User
router
  .route("/:id")
  .patch(protect, uploadUserPhoto, updateUser)
  .delete(protect, deleteUser)
  .get(protect, getUser);
//get all user
router.get("/", getAllUser);
//follow a user
// router.put("/:id/followers", userController.followers)
//unfollow a user

module.exports = router;

