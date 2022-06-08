const homePageGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("index.ejs", { authenticated: true });
  res.render("index.ejs", { authenticated: false });
};

const aboutGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("about.ejs", { authenticated: true });
  res.render("about.ejs", { authenticated: false });
};

const profileGet = (req, res) => {
  res.render("profile.ejs", { authenticated: true });
};

const loginGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("login.ejs", { authenticated: true });
  res.render("login.ejs", { authenticated: false });
};

const registerGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("register.ejs", { authenticated: true });
  res.render("register.ejs", { authenticated: false });
};

module.exports = {
  homePageGet,
  aboutGet,
  profileGet,
  loginGet,
  registerGet,
};
