const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../controllers/authController");

router
  .route("/")
  .get(postController.getAllPost)
  .post(protect, postController.createPost);

router
  .route("/:id")
  .patch(protect, postController.updatePost)
  .delete(protect, postController.deletePost)
  .get(postController.getPost);

module.exports = router;
