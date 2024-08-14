const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deliverySchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  shipper_id: {
    type: Schema.Types.ObjectId,
    ref: "Shipper",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
  },
});

var Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;
