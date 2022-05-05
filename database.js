const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.createConnection(process.env.dbString);

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
