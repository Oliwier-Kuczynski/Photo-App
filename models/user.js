const mongoose = require("mongoose");
const connection = require("../database");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

connection.model("User", UserSchema);

module.exports = connection;
