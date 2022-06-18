const connection = require("../models/products");
const Product = connection.models.Product;

const uploadPost = (req, res) => {
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

  newProduct.save();

  res.json({ status: "ok", message: "Item uploaded", redirectUrl: "/" });
};

const getAllProducts = async () => {
  const allProducts = await Product.find({});
  return allProducts;
};

module.exports = { uploadPost, getAllProducts };
