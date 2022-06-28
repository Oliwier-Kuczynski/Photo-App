const sizeOf = require("image-size");
const sharp = require("sharp");
const path = require("path");

const productConnection = require("../models/products");
const userConnection = require("../models/user");
const Product = productConnection.models.Product;
const User = userConnection.models.User;

const belongsToUser = (user, productId) => {
  if (user.uploadedProducts.includes(productId)) return true;
  return false;
};

// This utility optimizes img gets it's resolution and changes format of a original url
const imgUtility = (imgUrlOrginal, imgName) => {
  sharp(imgUrlOrginal)
    .webp({ quality: 80 })
    .resize({ width: 600 })
    .toFile(`uploads/optimized-images/${imgName}.webp`, (err, info) => {
      if (err) throw new Error("Sharp error");
    });

  const imgUrl = imgUrlOrginal
    .replaceAll(String.fromCharCode(92), "/")
    .split("/")
    .slice(1)
    .join("/");

  const optimizedImgUrl = `optimized-images/${imgName}.webp`;

  const { width, height } = sizeOf(imgUrlOrginal);

  const resolution = `${width}x${height}`;

  return { imgUrl, optimizedImgUrl, resolution };
};

const getSpecificProduct = async (id) => {
  try {
    const specificProduct = await Product.findById(id);

    return specificProduct;
  } catch (err) {
    throw new Error(`Can't get product`);
  }
};

///////////////////////////
// Work on this next
//////////////////////////

const getProducts = async (searchQuery, filter) => {
  try {
    if (!filter) filter = "added-date-ascending";

    const filterResults = async (findParameters) => {
      const fromTo = filter.includes("descending") ? 1 : -1;
      // date sorting
      if (filter.includes("added-date")) {
        return await Product.find(findParameters).sort({ createdAt: fromTo });
      }
      // price sorting
      if (filter.includes("price")) {
        return await Product.find(findParameters).sort({ price: fromTo });
      }
      // popularity sorting
      // NOT DONE YET
    };

    if (!searchQuery) {
      return filterResults({});
    }

    return filterResults({ $text: { $search: searchQuery } });
  } catch (err) {
    throw new Error(`Can't get products`);
  }
};

const getAllProductsUploadedByUser = async (req, res) => {
  try {
    const allProducts = await Product.find({}).sort({ createdAt: -1 });

    const allUserProductsIds = req.user.uploadedProducts;

    const allUserProducts = allProducts.filter((product) =>
      allUserProductsIds.includes(product._id)
    );

    return allUserProducts;
  } catch (err) {
    throw new Error(`Can't get products`);
  }
};

const uploadPost = async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const authorName = req.user.name;
    const authorId = req.user._id;
    const imgUrlOrginal = req.file.path;
    const imgName = path.parse(req.file.filename).name;

    const { imgUrl, optimizedImgUrl, resolution } = imgUtility(
      imgUrlOrginal,
      imgName
    );

    const newProduct = new Product({
      title,
      description,
      price,
      imgUrl,
      optimizedImgUrl,
      authorName,
      authorId,
      resolution,
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
    res.status(500).json({ status: "error", message: "Something went wrong" });
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

    let imgUrl = product.imgUrl,
      optimizedImgUrl = product.optimizedImgUrl,
      resolution = product.resolution;

    if (!belongsToUser(req.user, productId))
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to do this operation",
      });

    if (req.file) {
      const imgName = path.parse(req.file.filename).name;

      const {
        imgUrl: newImgUrl,
        optimizedImgUrl: newOptimizedImgUrl,
        resolution: newResolution,
      } = imgUtility(imgUrlOrginal, imgName);

      imgUrl = newImgUrl;
      optimizedImgUrl = newOptimizedImgUrl;
      resolution = newResolution;
    }

    await Product.updateOne(
      { _id: productId },
      {
        title,
        description,
        price,
        imgUrl,
        optimizedImgUrl,
        resolution,
      }
    );

    res
      .status(200)
      .json({ status: "ok", message: "Item edited", redirectUrl: "/profile" });
  } catch (err) {
    console.log(err);
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
