const { isAuth } = require("../authentication/authenticationCheck");
const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pagesController");

router.get("/", pagesController.homePageGet);

router.get("/about", pagesController.aboutGet);

router.get("/login", pagesController.loginGet);

router.get("/register", pagesController.registerGet);

router.get("/change-password", isAuth, pagesController.changePasswordGet);

router.get("/profile", isAuth, pagesController.profileGet);

router.get("/upload", pagesController.uploadGet);

module.exports = router;
