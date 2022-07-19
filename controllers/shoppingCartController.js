const userConnection = require("../models/user");
const productConnection = require("../models/products");
const User = userConnection.models.User;
const Product = productConnection.models.Product;

const getShopingCartItemsPost = async (req, res, next, ids = null) => {
  try {
    const productsIds = ids || req.body.cartItemsIds;

    if (req.isAuthenticated()) {
      const user = await User.findOneAndUpdate(
        { username: req.user.username },
        { $addToSet: { shoppingCart: { $each: productsIds } } },
        { new: true }
      );

      const products = await Product.find({ _id: { $in: user.shoppingCart } });

      if (ids) return products;

      return res
        .status(200)
        .json({ products, isLoggedin: true, ids: user.shoppingCart });
    }

    const products = await Product.find({ _id: { $in: productsIds } });

    if (ids) return products;

    res.status(200).json({ products, isLoggedin: false, ids: null });
  } catch (err) {
    res.status(500);
    console.log(err);
  }
};

const removeCartItemPost = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { $pull: { shoppingCart: id } });

    res.status(200).json({ status: "ok", message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

module.exports = {
  getShopingCartItemsPost,
  removeCartItemPost,
};
