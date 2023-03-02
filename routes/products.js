import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import Category from "../models/category.js";
import Product from "../models/product.js";

const productsRouter = express.Router();
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// configure multer storage and options
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadOptions = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  // limits: { fileSize: 1000000 },
});

// check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Get All Products
productsRouter.route("/").get(async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList)
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  res.status(200).json({ success: true, productList });
});

// Get One Product
productsRouter.route("/:id").get(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product)
    res.status(500).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, product });
});

// Add New Product
productsRouter.post("/", uploadOptions.single("image"), async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ error: true, message: "Invalid Category" });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No image in the request" });
    }

    // Upload image to cloudinary asynchronously
    const resultPromise = cloudinary.uploader.upload(req.file.path);

    // Create new product without image url
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    // Save the product to the database
    const newProduct = await product.save();
    if (!newProduct) {
      return res.status(500).json({
        error: true,
        message: "The product cannot be created",
      });
    }

    // Wait for the image upload to finish and update the product with the image url
    const result = await resultPromise;
    newProduct.image = result.secure_url;
    await newProduct.save();

    return res.status(201).json({
      error: false,
      newProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Update Product
productsRouter.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product Id" });
    }

    const {
      category,
      name,
      description,
      richDescription,
      brand,
      price,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found!" });
    }

    let imagePath = product.image;
    const file = req.file;
    if (file) {
      const result = await cloudinary.uploader.upload(file.path);
      imagePath = result.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        category,
        name,
        description,
        richDescription,
        brand,
        price,
        countInStock,
        rating,
        numReviews,
        isFeatured,
        image: imagePath,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Product updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete Product
productsRouter.route("/:id").delete(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found!" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: true, data: err, success: false });
    });
});

// Get total number of products
productsRouter.route("/get/count").get(async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) res.status(500).json({ success: false });
  res.status(200).json({ success: true, productCount });
});

// Get featured Products
productsRouter.route("/get/featured/:count").get(async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productFeatured = await Product.find({
    isFeatured: true,
  }).limit(+count);

  if (!productFeatured) res.status(500).json({ success: false });
  res.status(200).json({ success: true, productFeatured });
});

// Images upload
productsRouter
  .route("/gallery-images/:id")
  .put(uploadOptions.array("images", 5), async (req, res) => {
    try {
      const productId = req.params.id;

      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).send("Invalid Product Id");
      }

      const files = req.files;
      const promises = files.map((file) =>
        cloudinary.uploader.upload(file.path)
      );
      const results = await Promise.all(promises);
      const imagesPaths = results.map((result) => result.secure_url);

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { images: imagesPaths },
        { new: true }
      );

      if (!updatedProduct) {
        return res
          .status(500)
          .json({ error: true, message: "The gallery cannot be updated!" });
      }

      res.status(201).json({ error: false, updatedProduct });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

export default productsRouter;
