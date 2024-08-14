const express = require("express");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");

exports.getAllDelivery = (req, res, next) => {
  Delivery.find({})
    .populate("order_id")
    .populate("shipper_id")
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

exports.getDeliveryById = (req, res, next) => {
  const deliveryId = req.params.deliveryId;
  Delivery.findById(deliveryId)
    .populate("order_id")
    .populate("shipper_id")
    .then(
      (delivery) => {
        if (delivery) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(delivery);
        } else {
          res.statusCode = 404;
          res.end("delivery not found");
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getDeliveryByShipperId = (req, res, next) => {
  const shipperId = req.params.shipperId;
  Delivery.find({ shipper_id: shipperId })
    .populate("order_id")
    .populate("shipper_id")
    .then(
      (user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        } else {
          res.statusCode = 404;
          res.end("User not found");
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getDeliveryByOrderID = (req, res, next) => {
  const orderId = req.params.orderId;
  Delivery.find({ order_id: orderId })
    .populate("order_id")
    .populate("shipper_id")
    .then(
      (user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        } else {
          res.statusCode = 404;
          res.end("User not found");
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

// exports.getDeliveryByStoreId = async (req, res, next) => {
//   try {
//     const storeId = req.params.storeId;

//     // Tìm Role dựa trên mô tả
//     const order = await Order.find({ store_id: storeId });

//     if (!order) {
//       res.status(404).json({ error: "No store found with the Id" });
//       return;
//     }

//     const delivery = await Delivery.find({ order_id: order.id });

//     if (delivery && delivery.length > 0) {
//       res.status(200).json(delivery);
//     } else {
//       res.status(404).json({ error: "No delivery found with the store" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

exports.getDeliveryByStoreId = async (req, res, next) => {
  try {
    const storeId = req.params.storeId;
    const orders = await Order.find({ store_id: storeId });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for the store" });
    }

    const orderIds = orders.map((order) => order._id);
    const deliveries = await Delivery.find({ order_id: { $in: orderIds } });

    if (deliveries.length > 0) {
      res.status(200).json(deliveries);
    } else {
      res
        .status(404)
        .json({ error: "No deliveries found for the orders of this store" });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateDeliveryByID = (req, res, next) => {
  Delivery.findByIdAndUpdate(
    req.params.deliveryId,
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

exports.postAddDelivery = async (req, res, next) => {
  Delivery.create(req.body)
    .then(
      (delivery) => {
        console.log("delivery Created ", delivery);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(delivery);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
