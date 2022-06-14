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
      return res.status(320).json({
        status: "error",
        message: "Invalid credentials",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      //If Successful
      return res
        .status(320)
        .json({ redirectUrl: "/", status: "ok", message: "Logged in" });
    });
  })(req, res, next);
};

const registerPost = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser)
      return res.status(409).json({
        status: "error",
        message: "User already exists in our database",
      });

    const agreed = req.body.agreed;
    const name = req.body.name;
    const username = req.body.username;

    if (!agreed) {
      return res.status(451).json({
        status: "error",
        message: "You have to agree to our terms of service",
      });
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

    res
      .status(201)
      .json({ redirectUrl: "/", status: "ok", message: "New user created" });
  } catch (err) {
    res.status(500).json({ status: "error", message: `Something went wrong` });
  }
};

const logoutGet = (req, res) => {
  req.logout();

  res
    .status(200)
    .json({ status: "ok", message: "Logged out", redirectUrl: "/" });
};

const closeAccountPost = async (req, res) => {
  try {
    const username = req.user.username;
    await User.deleteOne({ username: username });

    req.logout();
    res
      .status(200)
      .json({ status: "ok", message: "Account deleted", redirectUrl: "/" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const changePasswordPost = (req, res) => {};

module.exports = {
  loginPost,
  registerPost,
  logoutGet,
  closeAccountPost,
  changePasswordPost,
};
