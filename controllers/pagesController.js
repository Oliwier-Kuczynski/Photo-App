const homePageGet = (req, res) => {
  res.render("index.ejs");
};

const aboutGet = (req, res) => {
  res.render("about.ejs");
};

const profileGet = (req, res) => {
  res.render("profile.ejs");
};

const loginGet = (req, res) => {
  res.render("login.ejs");
};

const registerGet = (req, res) => {
  res.render("register.ejs");
};

const protectedGet = (req, res) => {
  res.render("account.ejs");
};

module.exports = {
  homePageGet,
  aboutGet,
  profileGet,
  loginGet,
  registerGet,
  protectedGet,
};
