const { use } = require("passport");
const productConnection = require("../models/products");
const userConnection = require("../models/user");
const Product = productConnection.models.Product;
const User = userConnection.models.User;

const uploadPost = async (req, res) => {
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

  res.json({ status: "ok", message: "Item uploaded", redirectUrl: "/" });
};

const getAllProducts = async () => {
  const allProducts = await Product.find({});
  return allProducts;
};

const getAllProductsUploadedByUser = async (req, res) => {
  const allProducts = await Product.find({});

  const allUserProductsIds = req.user.uploadedProducts;

  const allUserProducts = allProducts.filter((product) =>
    allUserProductsIds.includes(product._id)
  );

  return allUserProducts;
};

module.exports = { uploadPost, getAllProducts, getAllProductsUploadedByUser };
