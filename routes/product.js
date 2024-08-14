const express = require("express");
// const passport = require("passport");
const productController = require("../controllers/productController");

const router = express.Router();
// const authenticateJWT = passport.authenticate("jwt", { session: false });

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config");

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const storageImg = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: config.CLOUDINARY_FOLDER_PRODUCT,
    resource_type: "auto",
  },
});

const uploadImgAndVideo = multer({ storage: storageImg });

router.post(
  "/addProduct",
  //   authenticateJWT,
  uploadImgAndVideo.fields([{ name: "image", maxCount: 5 }]),
  productController.addProduct
);

router.get(
  "/getAllProduct",
  //   authenticateJWT,
  productController.getAllProduct
);

router.get(
  "/getProductById/:productId",
  //   authenticateJWT,
  productController.getProductById
);

router.get(
  "/getProductByCategoryId/:categoryId",
  //   authenticateJWT,
  productController.getProductByCategoryId
);

router.get(
  "/searchProductByName",
  //   authenticateJWT,
  productController.searchProductByName
);

module.exports = router;
