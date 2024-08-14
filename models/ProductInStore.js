const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productInStoreSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

var ProductInStore = mongoose.model("ProductInStore", productInStoreSchema);

module.exports = ProductInStore;
