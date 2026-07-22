const multer = require("multer");
const path = require("path");

// Storage Configuration
const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/products");

    },

    filename: function (req, file, cb) {

        const uniqueName = Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

// File Filter
const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpeg|jpg|png|webp/;

    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {

        cb(null, true);

    } else {

        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));

    }

};

// Upload Object
const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        fileSize: 2 * 1024 * 1024 // 2 MB

    }

});

module.exports = upload;