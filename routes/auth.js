const router = require("express").Router();
const authController = require("./../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.get("/me", authController.protect, authController.getLoggedUser);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);
router.post(
  "/changePassword",
  authController.protect,
  authController.changePassword,
);
module.exports = router;
