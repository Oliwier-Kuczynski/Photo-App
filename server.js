const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
var cookieParser = require("cookie-parser");
const logRegRoutes = require("./routes/log-reg-router");
const pagesRoutes = require("./routes/pages-router");
const productsRoutes = require("./routes/products-router");
const shoppingCartRoutes = require("./routes/shopping-cart-router");
require("./authentication/passport");
require("dotenv").config();
require("ejs");

const port = process.env.PORT || 3000;
const app = express();

app.set("viewengine", "ejs");

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());

app.use(
  session({
    secret: process.env.sessionSECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.dbString,
      dbName: "Photo-App",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log(req.session);
//   console.log(req.user);
//   next();
// });

app.use(cookieParser());

app.use(logRegRoutes);
app.use(pagesRoutes);
app.use(productsRoutes);
app.use(shoppingCartRoutes);

app.listen(port, (err) => {
  if (err) console.error("App is not listening");
});
