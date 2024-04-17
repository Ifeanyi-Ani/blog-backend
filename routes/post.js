const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../controllers/authController");

router
  .route("/")
  .get(postController.getAllPost)
  .post(protect, postController.uploadPostImage, postController.createPost);

router.use(protect);
router
  .route("/:id")
  .patch(postController.uploadPostImage, postController.updatePost)
  .delete(postController.deletePost)
  .get(postController.getPost);

module.exports = router;
