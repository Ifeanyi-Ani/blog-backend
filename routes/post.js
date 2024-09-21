const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../controllers/authController");

router
  .route("/")
  .get(postController.getAllPost)

router.use(protect);
router
  .route("/:id")
  .delete(postController.deletePost)
  .get(postController.getPost);

module.exports = router;
