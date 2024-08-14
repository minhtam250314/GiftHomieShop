const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shipperSchema = new Schema({
  shipperName: {
    type: String,
    required: true,
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

var Shipper = mongoose.model("Shipper", shipperSchema);

module.exports = Shipper;
