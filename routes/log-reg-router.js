const express = require("express");
const router = express.Router();
const logRegController = require("../controllers/logRegController");

router.post("/login", logRegController.loginPost);

router.post("/register", logRegController.registerPost);

router.get("/logout", logRegController.logoutGet);

module.exports = router;
