const { isAuth } = require("../authentication/authenticationCheck");
const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pagesController");

router.get("/", pagesController.homePageGet);

router.get("/about", pagesController.aboutGet);
//////////////////////////
//Authenticate is missing
//////////////////////////
router.get("/login", pagesController.loginGet);

router.get("/register", pagesController.registerGet);

router.get("/protected", isAuth, pagesController.protectedGet);

module.exports = router;
