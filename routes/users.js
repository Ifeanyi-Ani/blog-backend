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

router.get("/", getAllUser);
// router.patch('/updateMe', authController.protect, userController.updateMe)
//update User

router.use(protect);
router
  .route("/:id")
  .patch(uploadUserPhoto, updateUser)
  .delete(deleteUser)
  .get(getUser);
//get all user
//follow a user
// router.put("/:id/followers", userController.followers)
//unfollow a user

module.exports = router;
