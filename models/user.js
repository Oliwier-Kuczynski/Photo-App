const mongoose = require("mongoose");
const connection = require("../database");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    uploadedProducts: {
      type: Array,
    },
    purchasedProducts: {
      type: Array,
    },
    shoppingCart: {
      type: Array,
    },
    verificationCode: {
      type: Number,
    },
    verificationCodeExpiration: {
      type: Number,
    },
  },
  { timestamps: true }
);

connection.model("User", UserSchema);

module.exports = connection;
