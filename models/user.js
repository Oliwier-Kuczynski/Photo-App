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
    uploadedImages: {
      type: { type: String },
      value: [String],
    },
    purchasedImages: {
      type: { type: String },
      value: [String],
    },
  },
  { timestamps: true }
);

connection.model("User", UserSchema);

module.exports = connection;
