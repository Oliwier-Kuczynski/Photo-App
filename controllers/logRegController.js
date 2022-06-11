const passport = require("passport");
const genPassword = require("../authentication/passwordUtils").genPassword;
const connection = require("../models/user");
const User = connection.models.User;

const loginPost = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(320).json({ redirectUrl: "/login" });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      //If Successful
      return res.status(320).json({ redirectUrl: "/" });
    });
  })(req, res, next);
};

const registerPost = async (req, res, next) => {
  const existingUser = await User.findOne({ username: req.body.username });

  if (existingUser)
    return res
      .status(409)
      .json({ message: "User already exists in our database" });

  const agreed = req.body.agreed;
  const name = req.body.name;
  const username = req.body.username;

  if (!agreed) {
    return res
      .status(451)
      .json({ message: "You have to agree to our terms of service" });
  }

  const { salt, hash } = genPassword(req.body.password);

  const newUser = new User({
    username,
    salt,
    hash,
    name,
    agreed,
  });

  newUser.save();

  res.status(201).json({ message: "All good" });
};

const logoutGet = (req, res) => {
  req.logout();
  res.redirect("/");
};

module.exports = { loginPost, registerPost, logoutGet };
