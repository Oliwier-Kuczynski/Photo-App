const sizeOf = require("image-size");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const productConnection = require("../models/products");
const userConnection = require("../models/user");
const Product = productConnection.models.Product;
const User = userConnection.models.User;

const belongsToUser = (user, productId) => {
  if (user.uploadedProducts.includes(productId)) return true;
  return false;
};

// This utility optimizes img gets it's resolution and changes format of a original url and adds watermark
const imgUtility = async (imgUrlOrginal, imgName) => {
  const imgUrl = imgUrlOrginal
    .replaceAll(String.fromCharCode(92), "/")
    .split("/")
    .slice(1)
    .join("/");

  const imgUrlWatermarked = `images/watermarked/${imgName}.webp`;

  const optimizedImgUrl = `optimized-images/${imgName}.webp`;

  const optimizedImgUrlWatermarked = `optimized-images/watermarked/${imgName}.webp`;

  try {
    const sharpStream = sharp({ failOn: "none" });

    const promises = [];

    promises.push(
      sharpStream
        .clone()
        .resize({ width: 600 })
        .webp({ quality: 80 })
        .toFile(`uploads/optimized-images/${imgName}.webp`)
    );

    promises.push(
      sharpStream
        .clone()
        .composite([
          {
            input: "public/Copyright.png",
            gravity: "centre",
            tile: true,
          },
        ])
        .webp()
        .toFile(`uploads/images/watermarked/${imgName}.webp`)
    );

    promises.push(
      sharpStream
        .clone()
        .resize({ width: 600 })
        .composite([
          {
            input: "public/Copyright.png",
            gravity: "centre",
            tile: true,
          },
        ])
        .webp({ quality: 80 })
        .toFile(`uploads/optimized-images/watermarked/${imgName}.webp`)
    );

    fs.createReadStream(imgUrlOrginal).pipe(sharpStream);

    const { width, height } = sizeOf(imgUrlOrginal);

    const resolution = `${width}x${height}`;

    await Promise.all(promises);

    return {
      imgUrl,
      optimizedImgUrl,
      imgUrlWatermarked,
      optimizedImgUrlWatermarked,
      resolution,
    };
  } catch (err) {
    try {
      fs.unlinkSync(`uploads/${imgUrl}`);
      fs.unlinkSync(`uploads/${optimizedImgUrl}`);
      fs.unlinkSync(`uploads/${imgUrlWatermarked}`);
      fs.unlinkSync(`uploads/${optimizedImgUrlWatermarked}`);
    } catch (err) {}
    throw new Error("Error in imgUtility function", err);
  }
};

const deleteUnnecessaryImages = (product) => {
  if (!product.isPurchased) {
    try {
      fs.unlinkSync(`uploads/${product.imgUrl}`);
      fs.unlinkSync(`uploads/${product.optimizedImgUrl}`);
      fs.unlinkSync(`uploads/${product.imgUrlWatermarked}`);
      fs.unlinkSync(`uploads/${product.optimizedImgUrlWatermarked}`);
    } catch (err) {}
  }

  try {
    fs.unlinkSync(`uploads/${product.imgUrlWatermarked}`);
    fs.unlinkSync(`uploads/${product.optimizedImgUrlWatermarked}`);
  } catch (err) {}
};

///////////////////////////
// Work on this next
//////////////////////////

const documentsLimit = 5;

const filterResults = async (filter, findParameters, startIndex = 0) => {
  try {
    const fromTo = filter.includes("descending") ? 1 : -1;
    // date sorting
    if (filter.includes("added-date")) {
      return await Product.find(findParameters)
        .sort({ createdAt: fromTo })
        .skip(startIndex)
        .limit(documentsLimit);
    }
    // price sorting
    if (filter.includes("price")) {
      return await Product.find(findParameters)
        .sort({ price: fromTo })
        .skip(startIndex)
        .limit(documentsLimit);
    }
    // popularity sorting
    // NOT DONE YET
  } catch (err) {
    throw new Error(`Can't get products`);
  }
};

const getSpecificProduct = async (id) => {
  try {
    const specificProduct = await Product.findById(id);

    return specificProduct;
  } catch (err) {
    throw new Error(`Can't get product`);
  }
};

const getProducts = (searchQuery, filter, startIndex) => {
  try {
    if (!filter) filter = "added-date-ascending";

    if (!searchQuery) {
      return filterResults(filter, {}, startIndex);
    }

    return filterResults(
      filter,
      { $text: { $search: searchQuery } },
      startIndex
    );
  } catch (err) {
    throw new Error(`Can't get products`);
  }
};

const getAllProductsUploadedByUser = async (
  req,
  res,
  next,
  startIndex = 0,
  productsIds
) => {
  try {
    const allUserProductsIds = productsIds || req.user.uploadedProducts;

    const allUserProducts = await Product.find({
      _id: { $in: allUserProductsIds },
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(documentsLimit);

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

    const {
      imgUrl,
      optimizedImgUrl,
      imgUrlWatermarked,
      optimizedImgUrlWatermarked,
      resolution,
    } = await imgUtility(imgUrlOrginal, imgName);

    const newProduct = new Product({
      title,
      description,
      price,
      imgUrl,
      optimizedImgUrl,
      imgUrlWatermarked,
      optimizedImgUrlWatermarked,
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
      imgUrlWatermarked = product.imgUrlWatermarked,
      optimizedImgUrlWatermarked = product.optimizedImgUrlWatermarked,
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
        imgUrlWatermarked: newImgUrlWatermarked,
        optimizedImgUrlWatermarked: newOptimizedImgUrlWatermarked,
        resolution: newResolution,
      } = await imgUtility(imgUrlOrginal, imgName);

      imgUrl = newImgUrl;
      optimizedImgUrl = newOptimizedImgUrl;
      imgUrlWatermarked = newImgUrlWatermarked;
      optimizedImgUrlWatermarked = newOptimizedImgUrlWatermarked;
      resolution = newResolution;

      deleteUnnecessaryImages(product);
    }

    await Product.updateOne(
      { _id: productId },
      {
        title,
        description,
        price,
        imgUrl,
        optimizedImgUrl,
        imgUrlWatermarked,
        optimizedImgUrlWatermarked,
        resolution,
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

    const product = await Product.findOne({ _id: productId });

    deleteUnnecessaryImages(product);

    product.delete();

    res
      .status(200)
      .json({ status: "ok", message: "Item deleted", redirectUrl: "/profile" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

const loadMorePost = async (req, res, next) => {
  try {
    const startIndex = req.body.startIndex;
    const searchQuery = req.body.searchQuery;
    const filter = req.body.filter;
    const callbackOption = req.body.callbackOption;

    if (callbackOption === "all") {
      const products = await getProducts(searchQuery, filter, startIndex);
      return res.status(200).json(products);
    }

    if (callbackOption === "uploaded-by-user") {
      const products = await getAllProductsUploadedByUser(
        req,
        res,
        next,
        startIndex
      );
      return res.status(200).json(products);
    }

    if (callbackOption === "uploaded-by-author") {
      const authorId = req.body.authorId;

      const allAuthorProducts = await User.findById(authorId).uploadedProducts;

      const products = await getAllProductsUploadedByUser(
        req,
        res,
        next,
        startIndex,
        allAuthorProducts
      );
      return res.status(200).json(products);
    }
  } catch (err) {
    res.status(500);
  }
};

module.exports = {
  uploadPost,
  editPost,
  getProducts,
  getAllProductsUploadedByUser,
  getSpecificProduct,
  deletePost,
  loadMorePost,
};
