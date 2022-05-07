const homePageGet = (req, res) => {
  res.render("index.ejs");
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

module.exports = { homePageGet, loginGet, registerGet, protectedGet };
