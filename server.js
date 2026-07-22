const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const flash = require("connect-flash");

const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();

// Database Connection
require("./config/db");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
// ================= FLASH =================
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render("index");
});


console.log("Admin routes loaded");
app.use("/admin",adminRoutes);
app.use("/customer", customerRoutes);


// Start Server
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});