const productsController = require("../controllers/productsController");

const renderPage = (req, res, page, data, resetPasswordRedirect) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  if (resetPasswordRedirect) {
    if (req.isAuthenticated()) return res.redirect("/");

    res.render(page, {
      authenticated: true,
      searchQuery,
      filter,
    });
  }

  if (req.isAuthenticated()) {
    return res.render(page, {
      authenticated: true,
      searchQuery,
      filter,
      ...data,
    });
  }

  res.render(page, {
    authenticated: false,
    searchQuery,
    filter,
    ...data,
  });
};

const homePageGet = async (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  try {
    let products = await productsController.getProducts(searchQuery, filter);

    renderPage(req, res, "index.ejs", { products }, false);
  } catch (err) {
    res.status(500);
  }
};

const aboutGet = (req, res) => {
  renderPage(req, res, "about.ejs", undefined, false);
};

const profileGet = async (req, res) => {
  try {
    const allUserProducts =
      await productsController.getAllProductsUploadedByUser(req, res);

    renderPage(
      req,
      res,
      "profile.ejs",
      { products: allUserProducts, usersName: req.user.name },
      false
    );
  } catch (err) {
    res.status(500);
  }
};

const loginGet = (req, res) => {
  renderPage(req, res, "login.ejs", undefined, false);
};

const registerGet = (req, res) => {
  renderPage(req, res, "register.ejs", undefined, false);
};

const changePasswordGet = (req, res) => {
  renderPage(req, res, "change-password.ejs", undefined, false);
};

const resetPasswordGet = (req, res) => {
  renderPage(req, res, "reset-password.ejs", undefined, true);
};

const uploadGet = (req, res) => {
  renderPage(req, res, "upload.ejs", undefined, false);
};

const editGet = async (req, res) => {
  try {
    const product = await productsController.getSpecificProduct(req.query.id);

    renderPage(req, res, "edit.ejs", { product }, false);
  } catch (err) {
    res.status(500);
  }
};

module.exports = {
  homePageGet,
  aboutGet,
  profileGet,
  loginGet,
  registerGet,
  uploadGet,
  changePasswordGet,
  editGet,
  resetPasswordGet,
};
