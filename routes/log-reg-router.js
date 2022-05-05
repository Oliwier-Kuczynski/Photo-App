const express = require("express");
const router = express.Router();
const passport = require("passport");
const genPassword = require("../passwordUtils").genPassword;
const connection = require("../database");
const User = connection.models.User;
// const logRegController = require("../controllers/log-reg-controller");

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/register",
  })
);

router.post("/register", async (req, res) => {
  const existingUser = await User.findOne({ username: req.body.username });
  if (existingUser) return res.json({ message: "User already exists" });

  const saltHash = genPassword(req.body.password);

  const { salt, hash } = saltHash;

  const newUser = new User({
    username: req.body.username,
    hash: hash,
    salt: salt,
  });

  newUser.save().then((user) => console.log(user));

  res.status(201).json({ message: "All good" });
});

module.exports = router;
