const paypal = require("paypal-rest-sdk");
const Order = require("../models/Order");
const ProductInStore = require("../models/ProductInStore");
const Delivery = require("../models/Delivery");
const Shipper = require("../models/Shipper");

// Configure PayPal SDK with your credentials
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AVAYen3_vYVlrsBPQvwLeiFgrVXmf6BAIyOwk_OBGPqXOrksIPxQDFGhc-8QyN3uHuxKP6quEjbyU1Gn",
  client_secret:
    "EMiBTFeAPOxhb4jy-1NtHRhlQkGu-D-CajreZmFCFk7n5xi2xO0uWC6l7fiqd5aLTYFhfYrtblvLkaSF",
});

exports.buyProduct = async (req, res) => {
  // Lấy thông tin đơn hàng từ request body
  const { user_id, product_id, store_id, quantity, price, location } = req.body;

  const totalPrice = quantity * price;

  // Tạo một đơn hàng mới trong cơ sở dữ liệu
  const newOrder = new Order({
    user_id,
    product_id,
    store_id,
    quantity,
    totalPrice,
    location,
    status: "false", // Set trạng thái đơn hàng là đang chờ
  });

  try {
    // Lưu đơn hàng vào cơ sở dữ liệu
    const savedOrder = await newOrder.save();
    console.log(savedOrder);
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://192.168.1.15:3000/order/responseSucessPayPal", // nhớ sữa lại url cho đồng bộ với mobile
        cancel_url: "http://192.168.1.15:3000/order/responseCancelPayPal", // nhớ sữa lại url cho đồng bộ với mobile
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `Order of ${user_id}`,
                sku: newOrder._id,
                price: totalPrice.toString(),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: totalPrice.toString(),
          },
          description: "Payment for order",
        },
      ],
    };
    // paypal.payment.create(create_payment_json, function (error, payment) {
    //   if (error) {
    //     throw error;
    //   } else {
    //     for (let i = 0; i < payment.links.length; i++) {
    //       if (payment.links[i].rel === "approval_url") {
    //         res.redirect(payment.links[i].href);
    //       }
    //     }
    //   }
    // });
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create PayPal payment" });
      } else {
        const approvalUrl = payment.links.find(
          (link) => link.rel === "approval_url"
        ).href;
        res.json({ url: approvalUrl });
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.payOrder = async (req, res) => {
  // Lấy thông tin đơn hàng từ request body
  const { user_id, order_id, totalPrice } = req.body;

  try {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://192.168.1.15:3000/order/responseSucessPayPal", // nhớ sữa lại url cho đồng bộ với mobile
        cancel_url: "http://192.168.1.15:3000/order/responseCancelPayPal", // nhớ sữa lại url cho đồng bộ với mobile
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `Order of ${user_id}`,
                sku: order_id,
                price: totalPrice.toString(),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: totalPrice.toString(),
          },
          description: "Payment for order",
        },
      ],
    };
    // paypal.payment.create(create_payment_json, function (error, payment) {
    //   if (error) {
    //     throw error;
    //   } else {
    //     for (let i = 0; i < payment.links.length; i++) {
    //       if (payment.links[i].rel === "approval_url") {
    //         res.redirect(payment.links[i].href);
    //       }
    //     }
    //   }
    // });
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create PayPal payment" });
      } else {
        const approvalUrl = payment.links.find(
          (link) => link.rel === "approval_url"
        ).href;
        res.json({ url: approvalUrl });
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.responseSucessPayPal = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    paypal.payment.execute(
      paymentId,
      { payer_id: PayerID },
      async (error, payment) => {
        if (error) {
          console.error("Error executing PayPal payment:", error);
          return res.status(500).json({ error: "Error processing payment" });
        } else {
          const orderID = payment.transactions[0].item_list.items[0].sku;
          console.log("orderID: ", orderID);
          const order = await Order.findOneAndUpdate(
            { _id: orderID, status: "false" }, // Tìm đơn hàng với order_id và status chưa được xác nhận
            { status: "true" }, // Cập nhật trạng thái đơn hàng thành completed
            { new: true } // Trả về đối tượng đã được cập nhật
          );
          console.log("order: ", order);
          if (!order) {
            return res.status(404).json({ error: "Order not found" });
          } else {
            // Nếu đơn hàng được tìm thấy và cập nhật thành công, giảm số lượng sản phẩm trong kho hàng
            const productInStore = await ProductInStore.findOne({
              product_id: order.product_id,
              store_id: order.store_id,
            });

            if (!productInStore) {
              return res
                .status(404)
                .json({ error: "Product not found in store" });
            }

            // Giảm số lượng của sản phẩm trong kho hàng
            productInStore.quantity -= order.quantity;
            await productInStore.save();

            // Trả về thông báo thành công
            return res.status(200).send("Payment successful!");
          }
        }
      }
    );
  } catch (error) {
    console.error("Error processing PayPal payment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.responseCancelPayPal = (req, res) => {
  // Xử lý hủy bỏ thanh toán
  res.send("Payment canceled!");
};

exports.addToCart = async (req, res) => {
  try {
    // Giả sử bạn nhận được dữ liệu từ client gửi lên, chẳng hạn như user_id, product_id, store_id và quantity
    const { user_id, product_id, store_id, quantity, price, location } =
      req.body;

    const totalPrice = quantity * price;

    // Tạo một đối tượng Order mới
    const newOrder = new Order({
      user_id: user_id,
      product_id: product_id,
      store_id: store_id,
      quantity: quantity,
      totalPrice: totalPrice,
      location: location,
      status: false, // Trạng thái mặc định là false
    });

    // Lưu đơn hàng vào cơ sở dữ liệu
    await newOrder.save();

    res.json({ success: true, message: "Đã tạo đơn hàng thành công." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Đã xảy ra lỗi khi tạo đơn hàng." });
  }
};

exports.getListOrder = async (req, res) => {
  const { userId } = req.params; // Lấy user_id từ params của request

  try {
    const orders = await Order.find({
      user_id: userId,
      status: "false", // Giả sử status được lưu dưới dạng String "false"
    })
      .populate("product_id")
      .populate("store_id"); // Điều này sẽ điền thông tin chi tiết từ các Models liên kết

    if (orders.length === 0) {
      // Không có orders nào được tìm thấy
      return res.json([]);
    }

    // Lặp qua mỗi đơn hàng và tính toán số lượng của sản phẩm trong kho hàng
    const ordersWithQuantity = await Promise.all(
      orders.map(async (order) => {
        // Lấy số lượng của sản phẩm trong kho hàng từ product_id và store_id
        const productInStore = await ProductInStore.findOne({
          product_id: order.product_id,
          store_id: order.store_id,
        }).select("quantity");

        if (!productInStore) {
          throw new Error(
            "Không tìm thấy số lượng của sản phẩm trong kho hàng"
          );
        }

        return {
          order: order,
          productQuantityInStore: productInStore.quantity, // Số lượng của sản phẩm trong kho hàng
        };
      })
    );

    // Trả về danh sách các đơn hàng với số lượng sản phẩm trong kho hàng
    res.json(ordersWithQuantity);
  } catch (error) {
    // Xử lý các trường hợp có lỗi
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { quantity, price, location } = req.body;

    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update quantity, totalPrice, and updateTime
    order.quantity = quantity;
    order.totalPrice = quantity * price;
    order.location = location;
    order.updateTime = new Date();
    await order.save();

    res.json({ message: "Order quantity updated successfully", order });
  } catch (error) {
    console.error("Error updating order quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by orderId and delete it
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm các đơn hàng của userId với status là true
    const orders = await Order.find({ user_id: userId, status: true }).populate(
      "product_id store_id"
    );

    // Lặp qua từng đơn hàng và lấy thông tin vận chuyển và người giao hàng
    const ordersWithDeliveryInfo = await Promise.all(
      orders.map(async (order) => {
        // Tìm thông tin vận chuyển của đơn hàng
        const deliveryInfo = await Delivery.findOne({ order_id: order._id });

        // Kiểm tra nếu không tìm thấy thông tin vận chuyển
        if (!deliveryInfo) {
          return {
            order: order,
            message: "Đơn hàng đang chờ xác nhận",
          };
        }

        // Nếu tìm thấy thông tin vận chuyển, tiếp tục tìm thông tin người giao hàng
        const shipperInfo = await Shipper.findById(deliveryInfo.shipper_id);

        // Kiểm tra xem shipperInfo có tồn tại không
        if (!shipperInfo) {
          throw new Error("Không tìm thấy thông tin người giao hàng");
        }

        return {
          order: order,
          delivery: deliveryInfo,
          shipper: shipperInfo,
        };
      })
    );

    res.json(ordersWithDeliveryInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWaitingAcceptOrder = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm các delivery của user với userId đã cho và có status là "Vận chuyển thành công"
    const deliveries = await Delivery.find({
      status: "Chờ xác nhận",
    }).populate({
      path: "order_id",
      match: { user_id: userId },
      select: "_id",
    });

    // Lấy ra các orderId từ danh sách deliveries
    const orderIds = deliveries.map((delivery) => delivery.order_id._id);

    // Tìm các đơn hàng có orderId trong danh sách orderIds
    const successfulDeliveries = await Order.find({
      _id: { $in: orderIds },
    });

    res.json(successfulDeliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWaitingDeliveryOrder = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm các delivery của user với userId đã cho và có status là "Vận chuyển thành công"
    const deliveries = await Delivery.find({
      status: "Chờ giao hàng",
    }).populate({
      path: "order_id",
      match: { user_id: userId },
      select: "_id",
    });

    // Lấy ra các orderId từ danh sách deliveries
    const orderIds = deliveries.map((delivery) => delivery.order_id._id);

    // Tìm các đơn hàng có orderId trong danh sách orderIds
    const successfulDeliveries = await Order.find({
      _id: { $in: orderIds },
    });

    res.json(successfulDeliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuccessDeliveryOrder = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm các delivery của user với userId đã cho và có status là "Vận chuyển thành công"
    const deliveries = await Delivery.find({
      status: "Chờ đánh giá",
    }).populate({
      path: "order_id",
      match: { user_id: userId },
      select: "_id",
    });

    // Lấy ra các orderId từ danh sách deliveries
    const orderIds = deliveries.map((delivery) => delivery.order_id._id);

    // Tìm các đơn hàng có orderId trong danh sách orderIds
    const successfulDeliveries = await Order.find({
      _id: { $in: orderIds },
    });

    res.json(successfulDeliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAccecptedOrder = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Tìm các delivery của user với userId đã cho và có status là "Vận chuyển thành công"
    const deliveries = await Delivery.find({
      status: "Đã đánh giá",
    }).populate({
      path: "order_id",
      match: { user_id: userId },
      select: "_id",
    });

    // Lấy ra các orderId từ danh sách deliveries
    const orderIds = deliveries.map((delivery) => delivery.order_id._id);

    // Tìm các đơn hàng có orderId trong danh sách orderIds
    const successfulDeliveries = await Order.find({
      _id: { $in: orderIds },
    });

    res.json(successfulDeliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate("user_id")
      .populate("product_id")
      .populate("store_id");

    if (!order) {
      return res.json({ message: "Không tìm thấy đơn hàng" });
    }

    const delivery = await Delivery.findOne({ order_id: orderId }).populate(
      "shipper_id"
    );

    if (!delivery) {
      return res.json({ message: "Không tìm thấy thông tin vận chuyển" });
    }

    res.json({
      order: order,
      delivery: delivery,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin đơn hàng:", error.message);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin đơn hàng" });
  }
};
