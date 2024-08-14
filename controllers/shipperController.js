const express = require("express");
const Shipper = require("../models/Shipper");
const Store = require("../models/Store");
const bcrypt = require("bcrypt");
const authenticate = require("../authenticate");

// exports.uploadImg = async (req, res) => {
//   try {
//     // Kiểm tra xem có file ảnh được tải lên hay không
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded." });
//     }

//     // Sử dụng thông tin từ đối tượng result trực tiếp
//     const imageUrl = req.file.path;

//     // Trả về URL của ảnh trên Cloudinary
//     res.status(200).json({ imageUrl });
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getAllShipper = (req, res, next) => {
  Shipper.find({})
    .populate("store_id")
    .then(
      (course) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(course);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getShipperById = (req, res, next) => {
  const shipperId = req.params.shipperId;
  Shipper.findById(shipperId)
    .populate("store_id")
    .then(
      (shipper) => {
        if (shipper) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(shipper);
        } else {
          res.statusCode = 404;
          res.end("User not found");
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getShipperByName = (req, res, next) => {
  const shipperName = req.params.shipperName;
  Shipper.find({ shipperName: shipperName })
    .populate("store_id")
    .then(
      (user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        } else {
          res.statusCode = 404;
          res.end("Shipper not found");
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getShipperByStore = async (req, res, next) => {
  try {
    const storeId = req.params.storeId;

    // Tìm Role dựa trên mô tả
    const store = await Store.findById(storeId);

    if (!store) {
      res.status(404).json({ error: "No store found with the Id" });
      return;
    }

    // Tìm tất cả người dùng với role_id tương ứng
    const shipper = await Shipper.find({ store_id: store.id });

    if (shipper && shipper.length > 0) {
      res.status(200).json(shipper);
    } else {
      res.status(404).json({ error: "No shipper found with the store" });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateShipperByID = (req, res, next) => {
  Shipper.findByIdAndUpdate(
    req.params.shipperId,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then(
      (role) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(role);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

// exports.postLoginShipper = async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     const user = await Shipper.findOne({ username });
//     // .populate("role_id");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Username và password không chính xác.",
//       });
//     }

//     // Kiểm tra mật khẩu đã hash
//     bcrypt.compare(password, Shipper.password, (err, result) => {
//       if (err || !result) {
//         return res.status(401).json({
//           success: false,
//           message: "Password không chính xác.",
//         });
//       }
//       // Nếu mật khẩu hợp lệ, tạo mã token và trả về cho người dùng
//       const token = authenticate.getToken({ _id: Shipper._id });
//       res.status(200).json({
//         success: true,
//         token: token,
//         user: user,
//         status: "Bạn đã đăng nhập thành công!",
//       });
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

exports.postAddShipper = async (req, res, next) => {
  try {
    const existingPhone = await Shipper.findOne({ phone: req.body.phone });

    if (existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone đã tồn tại." });
    }

    // Create the user
    const user = await Shipper.create({
      shipperName: req.body.shipperName,
      phone: req.body.phone,
      store_id: req.body.store_id,
    });

    // Return success response
    res.status(200).json({
      success: true,
      user: user,
      message: "Create shipper Successful!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// exports.fetchMe = async (req, res, next) => {
//   const userId = req.decoded._id;
//   try {
//     const user = await Shipper.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });
//     }
//     res.status(200).json({ success: true, user: user });
//   } catch (err) {
//     console.error("Error finding user:", err);
//     res.status(500).json({ success: false, message: "Internal server error." });
//   }
// };
