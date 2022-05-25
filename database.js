const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.createConnection(process.env.dbString);

module.exports = connection;
