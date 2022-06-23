const productsController = require("../controllers/productsController");

const homePageGet = async (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  let products = await productsController.getProducts(searchQuery, filter);

  if (req.isAuthenticated()) {
    return res.render("index.ejs", {
      authenticated: true,
      products: products,
      searchQuery,
      filter,
    });
  }
  res.render("index.ejs", {
    authenticated: false,
    products: products,
    searchQuery,
    filter,
  });
};

const aboutGet = (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  if (req.isAuthenticated())
    return res.render("about.ejs", {
      authenticated: true,
      searchQuery,
      filter,
    });
  res.render("about.ejs", { authenticated: false, searchQuery, filter });
};

const profileGet = async (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  const allUserProducts = await productsController.getAllProductsUploadedByUser(
    req,
    res
  );

  res.render("profile.ejs", {
    authenticated: true,
    products: allUserProducts,
    usersName: req.user.name,
    searchQuery,
    filter,
  });
};

const loginGet = (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  if (req.isAuthenticated())
    return res.render("login.ejs", {
      authenticated: true,
      searchQuery,
      filter,
    });
  res.render("login.ejs", { authenticated: false, searchQuery, filter });
};

const registerGet = (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  if (req.isAuthenticated())
    return res.render("register.ejs", {
      authenticated: true,
      searchQuery,
      filter,
    });
  res.render("register.ejs", { authenticated: false, searchQuery, filter });
};

const changePasswordGet = (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  res.render("change-password.ejs", {
    authenticated: true,
    searchQuery,
    filter,
  });
};

const uploadGet = (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  res.render("upload.ejs", { authenticated: true, searchQuery, filter });
};

const editGet = async (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  try {
    const product = await productsController.getSpecificProduct(req.query.id);

    res.render("edit.ejs", {
      authenticated: true,
      product: product,
      searchQuery,
      filter,
    });
  } catch (err) {
    res.status(500).send();
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
};
