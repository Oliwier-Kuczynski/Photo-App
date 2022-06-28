const nodemailer = require("nodemailer");
const passport = require("passport");
const {
  genPassword,
  validatePassword,
} = require("../authentication/passwordUtils");
const connection = require("../models/user");
const User = connection.models.User;

const doesUserExists = async (username) => {
  if (await User.findOne({ username: username })) return true;

  return false;
};

const sendMail = async (username, messageTitle, messageText, messageHtml) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL__ADRESS, // generated ethereal user
      pass: process.env.MAIL__PWD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: `"Portal Administration" <${process.env.MAIL__ADRESS}>`, // sender address
    to: username, // list of receivers
    subject: messageTitle, // Subject line
    text: messageText, // plain text body
    html: messageHtml, // html body
  });
};

const sendVerifictaionCodePost = async (req, res) => {
  try {
    const username = req.body.username;
    const exists = await doesUserExists(username);

    if (!exists)
      return res.status(401).json({
        status: "error",
        message: `User with this email doesn't exist or email is incorrect`,
      });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationCodeExpiration = Date.now() + 3600000;

    await User.findOneAndUpdate(
      { username: username },
      {
        verificationCode,
        verificationCodeExpiration,
      }
    );

    await sendMail(
      username,
      "Authentication Code",
      `A request has been recived to change the password for your account (${username}). This is your authentication code: ${verificationCode}`,
      `A request has been recived to change the password for your account (${username}).<br> This is your authentication code: <b>${verificationCode}</b>`
    );

    res.status(200).json({
      status: "ok",
      message: `Authentication code has been sent to you`,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: `Something went wrong` });
  }
};

const loginPost = (req, res, next) => {
  passport.authenticate("local", function (err, user) {
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

    if (await doesUserExists(username))
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

    req.logout();

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
        .json({ status: "error", message: `Password is incorrect` });

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
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const resetPasswordPost = async (req, res) => {
  try {
    const username = req.body.username;
    const newPassword = req.body.password;
    const code = Number(req.body.code);
    const exists = await doesUserExists(username);

    const { hash: newHash, salt: newSalt } = genPassword(newPassword);

    if (!exists)
      return res.status(401).json({
        status: "error",
        message: `User with this email doesn't exist or email is incorrect`,
      });

    const { verificationCode, verificationCodeExpiration } = await User.findOne(
      {
        username: username,
      }
    );

    if (verificationCode !== code)
      return res
        .status(401)
        .json({ status: "error", message: `Verification code is incorrect` });

    if (verificationCodeExpiration < Date.now())
      return res
        .status(400)
        .json({ status: "error", message: `Verification code expired` });

    await User.findOneAndUpdate(
      { username: username },
      {
        hash: newHash,
        salt: newSalt,
        verificationCode: "",
        verificationCodeExpiration: "",
      }
    );

    await sendMail(
      username,
      "Password update confirmation",
      "Your password has been updated",
      "Your password has been updated"
    );

    res.status(200).json({
      status: "ok",
      message: "Password updated",
      redirectUrl: "/login",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: `Something went wrong` });
  }
};

module.exports = {
  loginPost,
  registerPost,
  logoutGet,
  closeAccountPost,
  changePasswordPost,
  resetPasswordPost,
  sendVerifictaionCodePost,
};
