const productsController = require("../controllers/productsController");

const homePageGet = async (req, res) => {
  const allProducts = await productsController.getAllProducts();

  if (req.isAuthenticated()) {
    return res.render("index.ejs", {
      authenticated: true,
      products: allProducts,
    });
  }
  res.render("index.ejs", { authenticated: false, products: allProducts });
};

const aboutGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("about.ejs", { authenticated: true });
  res.render("about.ejs", { authenticated: false });
};

const profileGet = async (req, res) => {
  const allUserProducts = await productsController.getAllProductsUploadedByUser(
    req,
    res
  );

  res.render("profile.ejs", { authenticated: true, products: allUserProducts });
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

const changePasswordGet = (req, res) => {
  res.render("change-password.ejs", { authenticated: true });
};

const uploadGet = (req, res) => {
  if (req.isAuthenticated())
    return res.render("upload.ejs", { authenticated: true });
  res.render("upload.ejs", { authenticated: false });
};

module.exports = {
  homePageGet,
  aboutGet,
  profileGet,
  loginGet,
  registerGet,
  uploadGet,
  changePasswordGet,
};
