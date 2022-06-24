const mongoose = require("mongoose");
const connection = require("../database");

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    popularityScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ProductSchema.index(
  { title: "text", description: "text", authorName: "text" },
  {
    name: "productsIndex",
    weights: { title: 10, description: 7, authorName: 4 },
    autoIndex: true,
  }
);

connection.model("Product", ProductSchema);

module.exports = connection;
