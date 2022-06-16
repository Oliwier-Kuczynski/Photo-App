const passport = require("passport");
const {
  genPassword,
  validatePassword,
} = require("../authentication/passwordUtils");
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

const registerPost = async (req, res) => {
  try {
    const { agreed, name, username } = req.body;

    const existingUser = await User.findOne({ username: username });

    if (existingUser)
      return res.status(409).json({
        status: "error",
        message: "User already exists in our database",
      });

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

const changePasswordPost = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { username, hash: oldHash, salt: oldSalt } = req.user;

    if (!validatePassword(oldPassword, oldHash, oldSalt))
      return res
        .status(401)
        .json({ status: "error", message: `Password incorect` });

    const { hash: newHash, salt: newSalt } = genPassword(newPassword);

    await User.findOneAndUpdate(
      { username: username },
      { hash: newHash, salt: newSalt }
    );

    req.logout();
    res
      .status(200)
      .json({ status: "ok", message: "Password updated", redirectUrl: "/" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = {
  loginPost,
  registerPost,
  logoutGet,
  closeAccountPost,
  changePasswordPost,
};
