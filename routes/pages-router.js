const { isAuth } = require("../authentication/authenticationCheck");
const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pagesController");

router.get("/", pagesController.homePageGet);

router.get("/about", pagesController.aboutGet);

router.get("/login", pagesController.loginGet);

router.get("/register", pagesController.registerGet);

router.get("/profile", isAuth, pagesController.profileGet);

router.get("/author", pagesController.authorGet);

router.get("/upload", isAuth, pagesController.uploadGet);

router.get("/edit", isAuth, pagesController.editGet);

router.get("/change-password", isAuth, pagesController.changePasswordGet);

router.get("/reset-password", pagesController.resetPasswordGet);

router.get("/shoping-cart", pagesController.shopingCartGet);

module.exports = router;
