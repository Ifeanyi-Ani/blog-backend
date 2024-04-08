const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const { protect } = require("../controllers/authController");

router.post("/:postId/like", protect, likeController.likePost);
router.post("/:postId/unlike", protect, likeController.unlikePost);

module.exports = router;

