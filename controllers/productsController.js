const connection = require("../models/products");
const Product = connection.models.Product;

const uploadPost = (req, res) => {
  const id = uuidv4();
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const imgUrl = req.file.path;

  const newProduct = new Product({
    title,
    description,
    price,
    imgUrl,
  });

  newProduct.save();

  res.json("Item uploaded");
};

module.exports = { uploadPost };
