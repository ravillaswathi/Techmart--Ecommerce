const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Signup
router.get("/signup", adminController.signupPage);
router.post("/signup", adminController.signup);

// Login
router.get("/login", adminController.loginPage);
router.post("/login", adminController.login);

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Logout
router.get("/logout", adminController.logout);

// Categories
router.get("/categories", adminController.categoryPage);
router.post("/categories/add", adminController.addCategory);

router.get("/categories/edit/:id", adminController.editCategoryPage);
router.post("/categories/update/:id", adminController.updateCategory);

router.get("/categories/delete/:id", adminController.deleteCategory);

// Products
router.get("/products", adminController.productPage);
router.post(
"/products/add",
upload.single("image"),
adminController.addProduct
);
console.log("✅ Edit Product Route Loaded");
console.log("Edit route registered");
// Edit Product
router.get("/products/edit/:id", adminController.editProductPage);
// Update Product
router.post(
    "/products/update/:id",
    upload.single("image"),
    adminController.updateProduct
);
// Delete Product
router.get(
    "/products/delete/:id",
    adminController.deleteProduct
);

// Customers
router.get("/customers", adminController.customerPage);

router.post("/customers/add", adminController.addCustomer);

router.get("/customers/edit/:id", adminController.editCustomerPage);

router.post("/customers/update/:id", adminController.updateCustomer);

router.get("/customers/delete/:id", adminController.deleteCustomer);

// Orders
router.get("/orders", adminController.orderPage);

// Add Order
router.post("/orders/add", adminController.addOrder);

// Edit Order
router.get("/orders/edit/:id", adminController.editOrderPage);

// Update Order
router.post("/orders/update/:id", adminController.updateOrder);

// Delete Order
router.get("/orders/delete/:id", adminController.deleteOrder);

router.post("/orders/status/:id", adminController.updateOrderStatus);

//Inventory route
router.get("/inventory", adminController.inventoryPage);

// Payments
router.get("/payments", adminController.paymentPage);
router.post("/payments/add", adminController.addPayment);


// Reports
router.get("/reports", adminController.reportPage);

router.get("/sales-report", adminController.salesReport);
router.get("/sales-report/excel", adminController.exportSalesExcel);

console.log(router.stack.map(r => r.route && r.route.path));



module.exports = router;