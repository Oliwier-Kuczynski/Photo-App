const mongoose = require("mongoose");
const connection = require("../database");

const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: String,
    },
    imgUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

connection.model("Product", ProductSchema);

module.exports = connection;
