const { query } = require("express");
const productConnection = require("../models/products");
const userConnection = require("../models/user");
const Product = productConnection.models.Product;
const User = userConnection.models.User;

const belongsToUser = (user, productId) => {
  if (user.uploadedProducts.includes(productId)) return true;
  return false;
};

const getSpecificProduct = async (id) => {
  const specificProduct = await Product.findById(id);

  return specificProduct;
};

///////////////////////////
// Work on this next
//////////////////////////

const getProducts = async (searchQuery, filter) => {
  const query = searchQuery;

  if (!query) {
    return await Product.find({});
  }

  return await Product.find({ $text: { $search: query } });
};

const getAllProductsUploadedByUser = async (req, res) => {
  const allProducts = await Product.find({});

  const allUserProductsIds = req.user.uploadedProducts;

  const allUserProducts = allProducts.filter((product) =>
    allUserProductsIds.includes(product._id)
  );

  return allUserProducts;
};

const uploadPost = async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const authorName = req.user.name;
    const imgUrlOrginal = req.file.path;

    const imgUrl = imgUrlOrginal.replace("uploads", "");

    const newProduct = new Product({
      title,
      description,
      price,
      imgUrl,
      authorName,
    });

    const product = await newProduct.save();

    await User.findOneAndUpdate(
      { username: req.user.username },
      { $push: { uploadedProducts: product._id } }
    );

    res.status(200).json({
      status: "ok",
      message: "Item uploaded",
      redirectUrl: "/profile",
    });
  } catch (err) {
    res.status(500).json({ status: "erro", message: "Something went wrong" });
  }
};

const editPost = async (req, res) => {
  try {
    const productId = req.body.id;
    const product = await getSpecificProduct(productId);

    const title = req.body.title || product.title;
    const description = req.body.description || product.description;
    const price = req.body.price || product.price;
    const imgUrlOrginal = req.file?.path || product.imgUrl;
    const authorName = product.authorName;

    const imgUrl = imgUrlOrginal?.replace("uploads", "");

    if (!belongsToUser(req.user, productId))
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to do this operation",
      });

    await Product.replaceOne(
      { _id: productId },
      {
        title,
        description,
        price,
        imgUrl,
        authorName,
      }
    );

    res
      .status(200)
      .json({ status: "ok", message: "Item edited", redirectUrl: "/profile" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

const deletePost = async (req, res) => {
  try {
    const productId = req.body.id;

    if (!belongsToUser(req.user, productId))
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to do this operation",
      });

    await Product.findByIdAndDelete(productId);

    res
      .status(200)
      .json({ status: "ok", message: "Item deleted", redirectUrl: "/profile" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

module.exports = {
  uploadPost,
  editPost,
  getProducts,
  getAllProductsUploadedByUser,
  getSpecificProduct,
  deletePost,
};
