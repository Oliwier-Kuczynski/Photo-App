const productsController = require("../controllers/productsController");
const shoppingCartController = require("../controllers/shoppingCartController");
const userConnection = require("../models/user");
const User = userConnection.models.User;

const renderPage = (req, res, page, data) => {
  try {
    const searchQuery = req.query.searchquery || "";
    const filter = req.query.filter || "";

    if (req.originalUrl === "/reset-password") {
      if (req.isAuthenticated()) return res.redirect("/");

      return res.render(page, {
        authenticated: false,
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
  } catch (err) {
    throw new Error("Error in renderPage");
  }
};

const homePageGet = async (req, res) => {
  const searchQuery = req.query.searchquery || "";
  const filter = req.query.filter || "";

  try {
    const products = await productsController.getProducts(searchQuery, filter);

    renderPage(req, res, "index.ejs", { products });
  } catch (err) {
    res.status(500);
  }
};

const aboutGet = (req, res) => {
  renderPage(req, res, "about.ejs", undefined);
};

const profileGet = async (req, res) => {
  try {
    const allUserProducts =
      await productsController.getAllProductsUploadedByUser(req, res);

    renderPage(req, res, "profile.ejs", {
      products: allUserProducts,
      usersName: req.user.name,
    });
  } catch (err) {
    res.status(500);
  }
};

const authorGet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const authorId = req.query.authorId;

    if (userId === authorId) return res.status(302).redirect("/profile");

    const author = await User.findById(authorId);
    const authorName = author.name;

    const allAuthorProducts =
      await productsController.getAllProductsUploadedByUser(
        req,
        res,
        next,
        undefined,
        author.uploadedProducts
      );

    renderPage(req, res, "author.ejs", {
      products: allAuthorProducts,
      authorName,
    });
  } catch (err) {
    res.status(500);
  }
};

const loginGet = (req, res) => {
  renderPage(req, res, "login.ejs", undefined);
};

const registerGet = (req, res) => {
  renderPage(req, res, "register.ejs", undefined);
};

const changePasswordGet = (req, res) => {
  renderPage(req, res, "change-password.ejs", undefined);
};

const resetPasswordGet = (req, res) => {
  renderPage(req, res, "reset-password.ejs", undefined);
};

const uploadGet = (req, res) => {
  renderPage(req, res, "upload.ejs", undefined);
};

const editGet = async (req, res) => {
  try {
    const product = await productsController.getSpecificProduct(req.query.id);

    renderPage(req, res, "edit.ejs", { product });
  } catch (err) {
    res.status(500);
  }
};

const shopingCartGet = async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const products = await shoppingCartController.getShopingCartItemsPost(
        req,
        res,
        next,
        []
      );

      return renderPage(req, res, "shoping-cart.ejs", { products });
    }

    const ids = JSON.parse(req.cookies["cart-items-ids"]);

    const products = await shoppingCartController.getShopingCartItemsPost(
      req,
      res,
      next,
      ids
    );

    renderPage(req, res, "shoping-cart.ejs", { products });
  } catch (err) {
    res.status(500);
  }
};

module.exports = {
  homePageGet,
  aboutGet,
  profileGet,
  authorGet,
  loginGet,
  registerGet,
  uploadGet,
  changePasswordGet,
  editGet,
  resetPasswordGet,
  shopingCartGet,
};
