const db = require("../config/db");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");

// ================= HOME PAGE =================
exports.home = (req, res) => {

    db.query(
        "SELECT * FROM products ORDER BY product_id DESC",
        (err, products) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("customer/home", {
                customer: req.session.customer,
                products
            });

        }
    );

};

// ================= SIGNUP PAGE =================
exports.signupPage = (req, res) => {

    res.render("customer/signup");

};

// ================= SIGNUP =================
exports.signup = async (req, res) => {

    const { name, email, phone, password, address } = req.body;

    // Check if email already exists
    db.query(
        "SELECT * FROM customers WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            if (result.length > 0) {
                req.flash("error", "Email already registered.");
return res.redirect("/customer/signup");
            }

            try {

                // Encrypt Password
                const hashedPassword = await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO customers
                    (name, email, phone, password, address)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        phone,
                        hashedPassword,
                        address
                    ],
                    (err) => {

                        if (err) {
                            console.log(err);
                            req.flash("error", "Signup Failed");
return res.redirect("/customer/signup");
                        }

                        req.flash("success", "Registration Successful! Please Login.");
res.redirect("/customer/login");

                    }
                );

            } catch (error) {

                console.log(error);
                res.send("Password Encryption Failed");

            }

        }
    );

};
// ================= LOGIN PAGE =================
exports.loginPage = (req, res) => {

    res.render("customer/login");

};

// ================= LOGIN =================
exports.login = (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM customers WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);
                req.flash("error", "Database Error");
return res.redirect("/customer/login");
            }

            if (result.length === 0) {
               req.flash("error", "Invalid Email or Password");
return res.redirect("/customer/login"); 
            }

            const customer = result[0];

            const isMatch = await bcrypt.compare(
                password,
                customer.password
            );

            if (!isMatch) {
                return res.send("Invalid Email or Password");
            }

            req.session.customer = customer;

            req.flash("success", "Login Successful!");
res.redirect("/customer/home");

        }
    );

};

// ================= PROFILE PAGE =================
exports.profilePage = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    res.render("customer/profile", {
        customer: req.session.customer
    });

};

// ================= LOGOUT =================
exports.logout = (req, res) => {

    req.session.destroy(() => {

        res.redirect("/customer/login");

    });

};
// ================= ADD TO CART =================
exports.addToCart = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;
    const product_id = req.params.id;

    db.query(
        "SELECT * FROM cart WHERE customer_id=? AND product_id=?",
        [customer_id, product_id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            if (result.length > 0) {

                db.query(
                    "UPDATE cart SET quantity = quantity + 1 WHERE customer_id=? AND product_id=?",
                    [customer_id, product_id],
                    () => {
                        res.redirect("/customer/home");
                    }
                );

            } else {

                db.query(
                    "INSERT INTO cart(customer_id,product_id,quantity) VALUES(?,?,1)",
                    [customer_id, product_id],
                    () => {
                        res.redirect("/customer/home");
                    }
                );

            }

        }
    );

};
// ================= CART PAGE =================
exports.cartPage = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;

    const sql = `
    SELECT
        cart.cart_id,
        cart.quantity,
        products.*
    FROM cart
    JOIN products
    ON cart.product_id = products.product_id
    WHERE cart.customer_id = ?
    `;

    db.query(sql, [customer_id], (err, cartItems) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("customer/cart", {
            customer: req.session.customer,
            cartItems
        });

    });

};
// ================= ADD TO WISHLIST =================
exports.addToWishlist = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;
    const product_id = req.params.id;

    db.query(
        "SELECT * FROM wishlist WHERE customer_id=? AND product_id=?",
        [customer_id, product_id],
        (err, result) => {

            if (result.length > 0) {
                return res.redirect("/customer/home");
            }

            db.query(
                "INSERT INTO wishlist(customer_id,product_id) VALUES(?,?)",
                [customer_id, product_id],
                () => {
                    res.redirect("/customer/home");
                }
            );

        }
    );

};
// ================= WISHLIST PAGE =================
exports.wishlistPage = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;

    const sql = `
    SELECT
        wishlist.wishlist_id,
        products.*
    FROM wishlist
    JOIN products
    ON wishlist.product_id = products.product_id
    WHERE wishlist.customer_id = ?
    `;

    db.query(sql, [customer_id], (err, wishlistItems) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("customer/wishlist", {
            customer: req.session.customer,
            wishlistItems
        });

    });

};

exports.ordersPage = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;

    const sql = `
        SELECT *
        FROM orders
        WHERE customer_id = ?
        ORDER BY order_date DESC
    `;

    db.query(sql, [customer_id], (err, orders) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("customer/orders", {
            customer: req.session.customer,
            orders
        });

    });

};

exports.productsPage=(req,res)=>{

    db.query(
        "SELECT * FROM products",
        (err,products)=>{

            if(err){

                return res.send(err);

            }

            res.render("customer/products",{

                customer:req.session.customer,

                products

            });

        }
    );

}

exports.searchProducts = (req, res) => {

    const keyword = req.query.keyword;

    db.query(
        "SELECT * FROM products WHERE product_name LIKE ? OR brand LIKE ?",
        [`%${keyword}%`, `%${keyword}%`],
        (err, products) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            res.render("customer/home", {
                customer: req.session.customer,
                products
            });

        }
    );

};
// ================= EDIT PROFILE PAGE =================

exports.editProfilePage = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    res.render("customer/edit-profile", {
        customer: req.session.customer
    });

};


// ================= UPDATE PROFILE =================

exports.updateProfile = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const { name, email, phone, address } = req.body;

    const customer_id = req.session.customer.customer_id;

    const sql = `
        UPDATE customers
        SET
            name=?,
            email=?,
            phone=?,
            address=?
        WHERE customer_id=?
    `;

    db.query(
        sql,
        [name, email, phone, address, customer_id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Update Failed");
            }

            // Update session
            req.session.customer.name = name;
            req.session.customer.email = email;
            req.session.customer.phone = phone;
            req.session.customer.address = address;

            res.redirect("/customer/profile");

        }
    );

};


exports.orderSummaryPage = (req,res)=>{

    const customer_id = req.session.customer.customer_id;

    const sql = `
    SELECT
        cart.quantity,
        products.price
    FROM cart
    JOIN products
    ON cart.product_id = products.product_id
    WHERE cart.customer_id=?
    `;

    db.query(sql,[customer_id],(err,result)=>{

        if(err){
            return res.send(err);
        }

        let total=0;

        result.forEach(item=>{

            total += item.quantity * item.price;

        });

        res.render("customer/order-summary",{

            customer:req.session.customer,

            total

        });

    });

};

// ================= PLACE ORDER =================

exports.placeOrder = (req, res) => {

    if (!req.session.customer) {
        return res.redirect("/customer/login");
    }

    const customer_id = req.session.customer.customer_id;
    const payment_method = req.body.payment_method;

    // Get cart items with product details
    const cartSql = `
        SELECT
            cart.cart_id,
            cart.product_id,
            cart.quantity,
            products.product_name,
            products.price,
            products.stock
        FROM cart
        JOIN products
        ON cart.product_id = products.product_id
        WHERE cart.customer_id = ?
    `;

    db.query(cartSql, [customer_id], (err, cartItems) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (cartItems.length === 0) {
            return res.send("Your cart is empty.");
        }

        // Check Stock
        for (let item of cartItems) {

            if (item.quantity > item.stock) {

                return res.send(
                    `${item.product_name} has only ${item.stock} item(s) available.`
                );

            }

        }

        // Calculate Total
        let total = 0;

        cartItems.forEach(item => {

            total += item.quantity * item.price;

        });

        // Insert Order
        const orderSql = `
            INSERT INTO orders
            (customer_id,total_amount,payment_method)
            VALUES (?,?,?)
        `;

        db.query(orderSql,
            [customer_id, total, payment_method],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.send(err);
                }

                const order_id = result.insertId;

                let completed = 0;

                // Insert order items & reduce stock
                cartItems.forEach(item => {

                    db.query(
                        `INSERT INTO order_items
                        (order_id,product_id,quantity,price)
                        VALUES(?,?,?,?)`,
                        [
                            order_id,
                            item.product_id,
                            item.quantity,
                            item.price
                        ]
                    );

                    db.query(
                        `UPDATE products
                        SET stock = stock - ?
                        WHERE product_id = ?`,
                        [
                            item.quantity,
                            item.product_id
                        ]
                    );

                    completed++;

                    if (completed === cartItems.length) {

                        db.query(
                            "DELETE FROM cart WHERE customer_id=?",
                            [customer_id],
                            (err) => {

                                if (err) {
                                    console.log(err);
                                    return res.send(err);
                                }

                                res.redirect("/customer/orders");

                            }
                        );

                    }

                });

            });

    });

};



exports.increaseQuantity = (req, res) => {

    db.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE cart_id=?",
        [req.params.id],
        () => {
            res.redirect("/customer/cart");
        }
    );

};

exports.decreaseQuantity = (req, res) => {

    db.query(
        "UPDATE cart SET quantity = quantity - 1 WHERE cart_id=? AND quantity > 1",
        [req.params.id],
        () => {
            res.redirect("/customer/cart");
        }
    );

};

exports.removeCartItem = (req, res) => {

    db.query(
        "DELETE FROM cart WHERE cart_id=?",
        [req.params.id],
        () => {
            res.redirect("/customer/cart");
        }
    );

};

exports.removeWishlistItem = (req, res) => {

    db.query(
        "DELETE FROM wishlist WHERE wishlist_id=?",
        [req.params.id],
        (err) => {

            if (err) {
                return res.send(err);
            }

            res.redirect("/customer/wishlist");

        }
    );

};
// ================= PRODUCT DETAILS =================
exports.productDetails = (req, res) => {

    const product_id = req.params.id;

    db.query(
        "SELECT * FROM products WHERE product_id = ?",
        [product_id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            if (result.length === 0) {
                return res.send("Product Not Found");
            }

            res.render("customer/product-details", {
                customer: req.session.customer,
                product: result[0]
            });

        }
    );

};

exports.downloadInvoice = (req, res) => {

    const orderId = req.params.id;

    const sql = `
        SELECT
            orders.*,
            customers.name,
            customers.email,
            customers.address
        FROM orders
        JOIN customers
        ON orders.customer_id = customers.customer_id
        WHERE order_id=?
    `;

    db.query(sql, [orderId], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        if (result.length == 0) {
            return res.send("Invoice Not Found");
        }

        const order = result[0];

        const doc = new PDFDocument();

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Invoice-${order.order_id}.pdf`
        );

        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        doc.fontSize(24)
            .text("TechMart", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(18)
            .text("INVOICE");

        doc.moveDown();

        doc.fontSize(12)
            .text(`Invoice No : ${order.order_id}`);

        doc.text(`Date : ${new Date(order.order_date).toLocaleDateString()}`);

        doc.moveDown();

        doc.text(`Customer : ${order.name}`);

        doc.text(`Email : ${order.email}`);

        doc.text(`Address : ${order.address}`);

        doc.moveDown();

        doc.text(`Payment Method : ${order.payment_method}`);

        doc.text(`Order Status : ${order.status}`);

        doc.text(`Total Amount : ₹${order.total_amount}`);

        doc.moveDown(2);

        doc.fontSize(14)
            .text("Thank you for shopping with TechMart!", {
                align: "center"
            });

        doc.end();

    });

};