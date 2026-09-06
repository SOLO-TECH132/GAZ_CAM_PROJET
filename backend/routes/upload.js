/**
 * @file upload.js
 * @description Upload d'image pour les produits
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
    res.json({ filename: req.file.filename });
});

module.exports = router;
