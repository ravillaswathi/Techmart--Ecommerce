const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

// Home
router.get("/", customerController.home);
router.get("/home", customerController.home);
router.get("/search", customerController.searchProducts);

// Signup
router.get("/signup", customerController.signupPage);
router.post("/signup", customerController.signup);

// Login
router.get("/login", customerController.loginPage);
router.post("/login", customerController.login);

// Profile
router.get("/profile", customerController.profilePage);

router.get("/edit-profile", customerController.editProfilePage);
router.post("/edit-profile", customerController.updateProfile);

// Logout
router.get("/logout", customerController.logout);
//Cart
router.post("/cart/add/:id", customerController.addToCart);
router.get("/cart", customerController.cartPage);
router.post("/cart/increase/:id", customerController.increaseQuantity);
router.post("/cart/decrease/:id", customerController.decreaseQuantity);
router.post("/cart/remove/:id", customerController.removeCartItem);
//Wishlist
router.post("/wishlist/add/:id", customerController.addToWishlist);
router.get("/wishlist", customerController.wishlistPage);
router.post("/wishlist/remove/:id", customerController.removeWishlistItem);

router.get("/orders", customerController.ordersPage);


router.get("/products", customerController.productsPage);
router.get("/product/:id", customerController.productDetails);

router.get("/order-summary", customerController.orderSummaryPage);
router.post("/place-order", customerController.placeOrder);

router.get("/invoice/:id", customerController.downloadInvoice);


module.exports = router;