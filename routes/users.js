const express = require("express")
const router = express.Router();
const { json } = require('express');
const userController = require("../controllers/userController");
const authController = require("../controllers/authController")


// router.patch('/updateMe', authController.protect, userController.updateMe)
//update User
router
  .route("/:id")
  .patch(userController.updateUser)
  .delete(authController.protect, userController.deleteUser)
  .get(authController.protect, authController.restrictTo('admin'), userController.getUser)
//get all user
router.get("/", userController.getAllUser)
//follow a user
// router.put("/:id/followers", userController.followers)
//unfollow a user

module.exports = router;