const mongoose = require("mongoose");
const connection = require("../database");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    hash: String,
    salt: String,
  },
  { timestamps: true }
);

connection.model("User", UserSchema);

module.exports = connection;
