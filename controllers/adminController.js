const db = require("../config/db");
const ExcelJS = require("exceljs");

// Signup Page
exports.signupPage = (req, res) => {
    res.render("admin/signup");
};

// Login Page
exports.loginPage = (req, res) => {
    res.render("admin/login");
};

// Signup
exports.signup = (req, res) => {
    const { username, email, password } = req.body;

    const sql = `
        INSERT INTO admin (username, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [username, email, password], (err, result) => {

        if (err) {
            console.log("MySQL Error:", err);
            return res.send(`
                <h2>Signup Failed</h2>
                <pre>${err.code}</pre>
                <pre>${err.sqlMessage}</pre>
            `);
        }

        res.redirect("/admin/login");
    });
};
// Login
exports.login = (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM admin WHERE username=? AND password=?";

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            return res.send("Database Error");
        }

        if (result.length > 0) {

            req.session.admin = result[0];

            res.redirect("/admin/dashboard");

        } else {

            res.send("Invalid Username or Password");

        }

    });

};
// Dashboard
exports.dashboard = (req, res) => {

    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }

    db.query("SELECT COUNT(*) AS totalProducts FROM products", (err, productResult) => {

        if (err) throw err;

        db.query("SELECT COUNT(*) AS totalCustomers FROM customers", (err, customerResult) => {

            if (err) throw err;

            db.query("SELECT COUNT(*) AS totalOrders FROM orders", (err, orderResult) => {

                if (err) throw err;

                db.query("SELECT IFNULL(SUM(total_amount),0) AS revenue FROM orders", (err, revenueResult) => {

                    if (err) throw err;

                    db.query(
                        "SELECT product_name, stock FROM products WHERE stock <= 5",
                        (err, lowStock) => {

                            if (err) throw err;

                            res.render("admin/dashboard", {

                                admin: req.session.admin,

                                totalProducts: productResult[0].totalProducts,

                                totalCustomers: customerResult[0].totalCustomers,

                                totalOrders: orderResult[0].totalOrders,

                                revenue: revenueResult[0].revenue,

                                lowStock

                            });

                        }
                    );

                });

            });

        });

    });

};
// Logout
exports.logout = (req, res) => {

    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};

// Category Page
exports.categoryPage = (req, res) => {

    const sql = "SELECT * FROM category ORDER BY category_id ASC";

    db.query(sql, (err, result) => {

        if (err) throw err;

        res.render("admin/categories", {
            categories: result
        });

    });

};

// Add Category
exports.addCategory = (req, res) => {

    const { category_name, description } = req.body;

    const sql = `
    INSERT INTO category(category_name,description)
    VALUES(?,?)
    `;

    db.query(sql, [category_name, description], (err) => {

        if (err) throw err;

        res.redirect("/admin/categories");

    });

};
// Edit Category Page
exports.editCategoryPage = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM category WHERE category_id=?",
        [id],
        (err, result) => {

            if (err) throw err;

            res.render("admin/editCategory", {
                category: result[0]
            });

        }
    );
};

// Update Category
exports.updateCategory = (req, res) => {

    const id = req.params.id;

    const { category_name, description } = req.body;

    db.query(
        "UPDATE category SET category_name=?, description=? WHERE category_id=?",
        [category_name, description, id],
        (err) => {

            if (err) throw err;

            res.redirect("/admin/categories");

        }
    );
};

// Delete Category
exports.deleteCategory = (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM category WHERE category_id=?",
        [id],
        (err) => {

            if (err) throw err;

            res.redirect("/admin/categories");

        }
    );
};
// Product Page
exports.productPage = (req, res) => {

    const categorySql = "SELECT * FROM category";

    const productSql = `
    SELECT
        p.*,
        c.category_name
    FROM products p
    LEFT JOIN category c
    ON p.category_id = c.category_id
    ORDER BY p.product_id ASC
    `;

    db.query(categorySql, (err, categories) => {

        if (err) throw err;

        db.query(productSql, (err, products) => {

            if (err) throw err;

            res.render("admin/products", {
                categories,
                products
            });

        });

    });

};
// Add Product
exports.addProduct = (req, res) => {

    const {
        category_id,
        product_name,
        brand,
        price,
        stock,
        description
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const sql = `
    INSERT INTO products
    (category_id, product_name, brand, price, stock, image, description)
    VALUES (?,?,?,?,?,?,?)
    `;

    db.query(sql,
    [
        category_id,
        product_name,
        brand,
        price,
        stock,
        image,
        description
    ],
    (err)=>{

        if(err){
            console.log(err);
            return res.send("Error");
        }

        res.redirect("/admin/products");

    });

};
// Edit Product Page
exports.editProductPage = (req, res) => {
    res.send("Controller Working. Product ID = " + req.params.id);
};

 //Delete Product
 exports.deleteProduct = (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM products WHERE product_id=?",
        [id],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Delete Failed");
            }

            res.redirect("/admin/products");

        }
    );

};
// Update Product
exports.updateProduct = (req, res) => {

    const id = req.params.id;

    const {
        category_id,
        product_name,
        brand,
        price,
        stock,
        description
    } = req.body;

    let sql;
    let values;

    if (req.file) {

        sql = `
            UPDATE products
            SET category_id=?,
                product_name=?,
                brand=?,
                price=?,
                stock=?,
                image=?,
                description=?
            WHERE product_id=?
        `;

        values = [
            category_id,
            product_name,
            brand,
            price,
            stock,
            req.file.filename,
            description,
            id
        ];

    } else {

        sql = `
            UPDATE products
            SET category_id=?,
                product_name=?,
                brand=?,
                price=?,
                stock=?,
                description=?
            WHERE product_id=?
        `;

        values = [
            category_id,
            product_name,
            brand,
            price,
            stock,
            description,
            id
        ];

    }

    db.query(sql, values, (err) => {

        if (err) throw err;

        res.redirect("/admin/products");

    });

};
// CUSTOMER PAGE

exports.customerPage = (req, res) => {

    const db = require("../config/db");

    db.query("SELECT * FROM customers ORDER BY customer_id ASC", (err, customers) => {

        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        res.render("admin/customers", {
            admin: req.session.admin,
            customers
        });

    });

};

// ADD CUSTOMER

exports.addCustomer = (req, res) => {

    const db = require("../config/db");

    const {
        name,
        email,
        phone,
        address
    } = req.body;

    const sql = `
        INSERT INTO customers
        (name,email,phone,address)
        VALUES(?,?,?,?)
    `;

    db.query(sql,
        [name,email,phone,address],
        (err)=>{

            if(err){
                console.log(err);
                return res.send("Database Error");
            }

            res.redirect("/admin/customers");

        });

};
// edit customer
exports.editCustomerPage=(req,res)=>{

    const id=req.params.id;

    db.query(
        "SELECT * FROM customers WHERE customer_id=?",
        [id],
        (err,result)=>{

            if(err) throw err;

            res.render("admin/editCustomer",{
                customer:result[0]
            });

        });

};
// Update customer
exports.updateCustomer=(req,res)=>{

    const id=req.params.id;

    const {
        name,
        email,
        phone,
        address
    }=req.body;

    db.query(
        `UPDATE customers
        SET
        name=?,
        email=?,
        phone=?,
        address=?
        WHERE customer_id=?`,
        [
            name,
            email,
            phone,
            address,
            id
        ],
        (err)=>{

            if(err) throw err;

            res.redirect("/admin/customers");

        });

};
// Delete customer
exports.deleteCustomer=(req,res)=>{

    const id=req.params.id;

    db.query(
        "DELETE FROM customers WHERE customer_id=?",
        [id],
        (err)=>{

            if(err) throw err;

            res.redirect("/admin/customers");

        });

};

// ================= ORDER PAGE =================

exports.orderPage = (req, res) => {

    const customerQuery = "SELECT * FROM customers ORDER BY customer_id DESC";
    const productQuery = "SELECT * FROM products ORDER BY product_id DESC";

    const orderQuery = `
    SELECT
        o.order_id,
        c.name AS customer_name,
        o.order_date,
        o.total_amount,
        o.status
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    ORDER BY o.order_id DESC
    `;

    db.query(customerQuery, (err, customers) => {

        if (err) throw err;

        db.query(productQuery, (err, products) => {

            if (err) throw err;

            db.query(orderQuery, (err, orders) => {

                if (err) throw err;

                res.render("admin/orders", {
                    customers,
                    products,
                    orders
                });

            });

        });

    });

};

// ================= ADD ORDER =================

exports.addOrder = (req, res) => {

    const {
        customer_id,
        product_id,
        quantity,
        status
    } = req.body;

    // Get product price
    db.query(
        "SELECT price FROM products WHERE product_id = ?",
        [product_id],
        (err, result) => {

            if (err) throw err;

            if (result.length === 0) {
                return res.send("Product not found");
            }

            const price = result[0].price;
            const total = price * quantity;

            // Insert into Orders table
            db.query(
                "INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)",
                [customer_id, total, status],
                (err, orderResult) => {

                    if (err) throw err;

                    const orderId = orderResult.insertId;

                    // Insert into Order Items
                    db.query(
                        `INSERT INTO order_items
                        (order_id, product_id, quantity, price, subtotal)
                        VALUES (?, ?, ?, ?, ?)`,
                        [
                            orderId,
                            product_id,
                            quantity,
                            price,
                            total
                        ],
                        (err) => {

                            if (err) throw err;

                            // Update Product Stock
                            db.query(
                                "UPDATE products SET stock = stock - ? WHERE product_id = ?",
                                [quantity, product_id],
                                (err) => {

                                    if (err) throw err;

                                    res.redirect("/admin/orders");

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};


// ================= EDIT ORDER PAGE =================
exports.editOrderPage = (req, res) => {

    const id = req.params.id;

    const customerQuery = "SELECT * FROM customers";
    const productQuery = "SELECT * FROM products";

    const orderQuery = `
        SELECT
            o.order_id,
            o.customer_id,
            oi.product_id,
            oi.quantity,
            o.total_amount,
            o.status
        FROM orders o
        INNER JOIN order_items oi
            ON o.order_id = oi.order_id
        WHERE o.order_id = ?
    `;

    db.query(customerQuery, (err, customers) => {

        if (err) throw err;

        db.query(productQuery, (err, products) => {

            if (err) throw err;

            db.query(orderQuery, [id], (err, result) => {

                if (err) throw err;

                console.log(result);   // <-- Add this

                if (result.length === 0) {
                    return res.send("Order not found");
                }

                res.render("admin/editOrder", {
                    order: result[0],
                    customers,
                    products
                });

            });

        });

    });

};

// ================= UPDATE ORDER =================

exports.updateOrder = (req, res) => {

    const id = req.params.id;

    const {
        customer_id,
        product_id,
        quantity,
        status
    } = req.body;

    db.query(
        "SELECT price, stock FROM products WHERE product_id=?",
        [product_id],
        (err, result) => {

            if (err) throw err;

            const price = result[0].price;
            const total = price * quantity;

            db.query(
                "UPDATE orders SET customer_id=?, total_amount=?, status=? WHERE order_id=?",
                [customer_id, total, status, id],
                (err) => {

                    if (err) throw err;

                    db.query(
                        `UPDATE order_items
                        SET
                        product_id=?,
                        quantity=?,
                        price=?,
                        subtotal=?
                        WHERE order_id=?`,
                        [
                            product_id,
                            quantity,
                            price,
                            total,
                            id
                        ],
                        (err) => {

                            if (err) throw err;

                            res.redirect("/admin/orders");

                        }
                    );

                }
            );

        }
    );

};
// DELETE ORDER
exports.deleteOrder = (req, res) => {
    const id = req.params.id;

    db.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id=?",
        [id],
        (err, items) => {
            if (err) {
                console.error(err);
                return res.status(500).send(err.message);
            }

            const restoreStock = (index = 0) => {
                if (index >= items.length) {
                    return deletePayment();
                }

                db.query(
                    "UPDATE products SET stock = stock + ? WHERE product_id=?",
                    [items[index].quantity, items[index].product_id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send(err.message);
                        }

                        restoreStock(index + 1);
                    }
                );
            };

            function deletePayment() {
                db.query(
                    "DELETE FROM payments WHERE order_id=?",
                    [id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send(err.message);
                        }

                        deleteOrderItems();
                    }
                );
            }

            function deleteOrderItems() {
                db.query(
                    "DELETE FROM order_items WHERE order_id=?",
                    [id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send(err.message);
                        }

                        deleteOrder();
                    }
                );
            }

            function deleteOrder() {
                db.query(
                    "DELETE FROM orders WHERE order_id=?",
                    [id],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send(err.message);
                        }

                        res.redirect("/admin/orders");
                    }
                );
            }

            if (items.length > 0) {
                restoreStock();
            } else {
                deletePayment();
            }
        }
    );
};
// ================= INVENTORY PAGE =================

exports.inventoryPage = (req, res) => {

    const sql = `
        SELECT
            product_id,
            product_name,
            brand,
            stock,
            price
        FROM products
        ORDER BY stock ASC
    `;

    db.query(sql, (err, products) => {

        if (err) throw err;

        res.render("admin/inventory", {
            products
        });

    });

};
// ================= PAYMENT PAGE =================

exports.paymentPage = (req, res) => {

    const orderQuery = `
        SELECT
            order_id,
            total_amount
        FROM orders
        ORDER BY order_id ASC
    `;

    const paymentQuery = `
        SELECT
            p.payment_id,
            p.payment_method,
            p.payment_status,
            p.paid_at AS payment_date,
            o.order_id,
            o.total_amount
        FROM payments p
        INNER JOIN orders o
        ON p.order_id = o.order_id
        ORDER BY p.payment_id ASC
    `;

    db.query(orderQuery, (err, orders) => {

        if (err) {
            console.log(err);
            return res.send(err.sqlMessage);
        }

        db.query(paymentQuery, (err, payments) => {

            if (err) {
                console.log(err);
                return res.send(err.sqlMessage);
            }

            res.render("admin/payments", {
                orders,
                payments
            });

        });

    });

};
// ================= ADD PAYMENT =================

exports.addPayment = (req, res) => {

    const {
        order_id,
        payment_method,
        payment_status
    } = req.body;

    const sql = `
        INSERT INTO payments
        (order_id, payment_method, payment_status)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [order_id, payment_method, payment_status],
        (err) => {

            if (err) throw err;

            res.redirect("/admin/payments");

        }
    );

};
// ================= REPORT PAGE =================

exports.reportPage = (req, res) => {

    const dashboardQuery = `
        SELECT
            (SELECT COUNT(*) FROM products) AS totalProducts,
            (SELECT COUNT(*) FROM customers) AS totalCustomers,
            (SELECT COUNT(*) FROM orders) AS totalOrders,
            (SELECT IFNULL(SUM(total_amount),0) FROM orders) AS totalRevenue
    `;

    const orderQuery = `
        SELECT
            o.order_id,
            c.name AS customer_name,
            o.order_date,
            o.total_amount,
            o.status
        FROM orders o
        JOIN customers c
        ON o.customer_id = c.customer_id
        ORDER BY o.order_id DESC
    `;

    db.query(dashboardQuery, (err, dashboard) => {

        if (err) throw err;

        db.query(orderQuery, (err, orders) => {

            if (err) throw err;

            res.render("admin/reports", {
                dashboard: dashboard[0],
                orders
            });

        });

    });

};

exports.updateOrderStatus = (req, res) => {

    const orderId = req.params.id;
    const status = req.body.status;

    db.query(
        "UPDATE orders SET status=? WHERE order_id=?",
        [status, orderId],
        (err) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            req.flash("success", "Order status updated successfully.");

            res.redirect("/admin/orders");

        }
    );

};

exports.salesReport = (req, res) => {

    const sql = `
        SELECT
            orders.order_id,
            customers.name,
            orders.total_amount,
            orders.status,
            orders.payment_method,
            orders.order_date
        FROM orders
        JOIN customers
        ON orders.customer_id = customers.customer_id
        ORDER BY orders.order_date DESC
    `;

    db.query(sql, (err, reports) => {

        if (err) return res.send(err);

        res.render("admin/sales-report", {
            reports
        });

    });

};
exports.exportSalesExcel = (req, res) => {

    const sql = `
        SELECT
            orders.order_id,
            customers.name,
            orders.total_amount,
            orders.status,
            orders.payment_method,
            orders.order_date
        FROM orders
        JOIN customers
        ON orders.customer_id = customers.customer_id
        ORDER BY orders.order_date DESC
    `;

    db.query(sql, async (err, reports) => {

        if (err) throw err;

        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet("Sales Report");

        worksheet.columns = [

            { header: "Order ID", key: "order_id", width: 12 },

            { header: "Customer", key: "name", width: 25 },

            { header: "Amount", key: "total_amount", width: 15 },

            { header: "Status", key: "status", width: 20 },

            { header: "Payment", key: "payment_method", width: 20 },

            { header: "Order Date", key: "order_date", width: 25 }

        ];

        reports.forEach(report => {

            worksheet.addRow(report);

        });

        worksheet.getRow(1).font = {
            bold: true
        };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=SalesReport.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    });

};