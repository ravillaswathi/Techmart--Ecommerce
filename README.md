# TechMart – E-Commerce Management System

## Project Overview

TechMart is a web-based E-Commerce Management System developed to simplify and manage online retail operations. The system provides separate functionalities for administrators and customers, allowing efficient product management, category management, inventory tracking, order processing, payment management, and customer interaction.

## Objectives

- To provide a user-friendly online shopping platform.
- To help administrators manage products, categories, customers, inventory, orders, and payments.
- To provide customers with an easy way to browse products and place orders.
- To centralize e-commerce operations in a single web-based system.

## Key Features

### Admin Module
- Admin registration and login
- Admin dashboard
- Product management
- Category management
- Customer management
- Inventory management
- Order management
- Payment management
- Sales reports

### Customer Module
- Customer registration and login
- Browse products
- View product details
- Add products to cart
- Manage wishlist
- Place orders
- View order history
- Manage customer profile

## Technologies Used

- Node.js
- Express.js
- EJS
- MySQL
- HTML5
- CSS3
- JavaScript
- Bootstrap
- Git and GitHub

## System Architecture

The application follows a web-based client-server architecture.

- **Frontend:** EJS, HTML, CSS, JavaScript
- **Backend:** Node.js and Express.js
- **Database:** MySQL
- **Server:** Express.js application server

## Project Structure

```text
Techmart-Ecommerce/
│
├── config/
├── controllers/
├── middleware/
├── public/
├── routes/
├── uploads/
├── views/
├── package.json
├── package-lock.json
├── server.js
└── .gitignore

## Installation and Setup

### 1. Clone the Repository
git clone https://github.com/ravillaswathi/Techmart--Ecommerce.git 

### 2. Navigate to the Project Folder
cd Techmart--Ecommerce
3. Install Dependencies
npm install
4. Configure the Database

Create a MySQL database and configure the database connection details using environment variables.

Example:

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
PORT=3000
5. Start the Application
node server.js
6. Open the Application

Open the following address in your browser:

http://localhost:3000
Quick Start Guide for Administrators
Open the application.
Log in using administrator credentials.
Open the Admin Dashboard.
Manage products and categories.
Monitor inventory.
Manage customers and orders.
Review payment information.
Generate and view sales reports.
API and Application Routes

The application uses Express.js routes to manage different system functionalities.

The main functional areas include:

User authentication
Admin authentication
Product management
Category management
Customer management
Inventory management
Cart management
Order processing
Payment management
Sales reporting
Database

The application uses MySQL for storing and managing application data.

The database stores information related to:

Administrators
Customers
Products
Categories
Inventory
Cart items
Orders
Payments
Wishlist information
Security

Sensitive information such as database passwords and environment variables should not be committed to a public repository. These values should be stored securely using environment configuration files.

The .env file should be used for sensitive configuration values such as:

Database credentials
Secret keys
Server configuration
Testing

The application should be tested for:

User registration and login
Admin authentication
Product management
Category management
Inventory updates
Cart operations
Order placement
Payment record management
Sales report generation
Database connectivity
Deployment

The application can be deployed to a cloud environment by:

Uploading the source code to GitHub.
Configuring the production database.
Setting environment variables securely.
Connecting the application to a cloud hosting platform.
Testing all application features in the live environment.
Future Enhancements
Online payment gateway integration
Cloud deployment
Advanced analytics dashboard
Email notifications
Mobile application support
AI-based product recommendations
Improved security features
Order tracking and delivery management
Project Repository

GitHub Repository:

https://github.com/ravillaswathi/Techmart--Ecommerce

Author

Ravilla Swathi

B.Tech – Computer Science and Engineering

