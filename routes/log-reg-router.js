const express = require("express");
const router = express.Router();
const passport = require("passport");
const genPassword = require("../passwordUtils").genPassword;
const connection = require("../database");
const User = connection.models.User;
// const logRegController = require("../controllers/log-reg-controller");

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(320).json({ redirectUrl: "/register" });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      //If Successful
      return res.status(320).json({ redirectUrl: "/" });
    });
  })(req, res, next);
});

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
