const express = require("express");
const router = express.Router();
const logRegController = require("../controllers/logRegController");
const { isAuth } = require("../authentication/authenticationCheck");

router.post("/login", logRegController.loginPost);

router.post("/register", logRegController.registerPost);

router.post("/change-password", isAuth, logRegController.changePasswordPost);

router.post("/close-account", isAuth, logRegController.closeAccountPost);

router.post("/reset-password", logRegController.resetPasswordPost);

router.post(
  "/send-verification-code",
  logRegController.sendVerifictaionCodePost
);

router.get("/logout", logRegController.logoutGet);

module.exports = router;
