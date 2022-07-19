const express = require("express");
const router = express.Router();
const shoppingCartController = require("../controllers/shoppingCartController");

router.post("/get-cart-items", shoppingCartController.getShopingCartItemsPost);
router.post("/remove-from-cart", shoppingCartController.removeCartItemPost);

module.exports = router;
