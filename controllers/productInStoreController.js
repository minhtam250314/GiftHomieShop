const ProductInStore = require("../models/ProductInStore");
const Store = require("../models/Store");
const Product = require("../models/Product");

exports.addProductInStore = (req, res, next) => {
  ProductInStore.create(req.body)
    .then(
      (productInStore) => {
        console.log("Product In Store Created ", productInStore);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(productInStore);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.checkQuantityProductInStore = async (req, res) => {
  try {
    const { province, district } = req.query;

    // Tìm cửa hàng dựa trên tỉnh và huyện
    const stores = await Store.find({ province, district });

    if (stores.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy cửa hàng ở địa chỉ này." });
    }

    // Lặp qua các cửa hàng để kiểm tra số lượng sản phẩm
    const result = [];
    for (const store of stores) {
      const productsInStore = await ProductInStore.find({
        store_id: store._id,
      });

      if (productsInStore.length === 0) {
        result.push({
          storeName: store.storeName,
          store_id: store._id,
          message: "Cửa hàng này không có hàng.",
        });
      } else {
        const productsWithQuantity = [];
        for (const productInStore of productsInStore) {
          // Truy vấn tên sản phẩm từ bảng Product
          const product = await Product.findById(productInStore.product_id);
          productsWithQuantity.push({
            productName: product.productName,
            product_id: productInStore.product_id,
            quantity: productInStore.quantity,
          });
        }

        // Kiểm tra số lượng sản phẩm và thông báo khi sản phẩm hết hàng
        productsWithQuantity.forEach((product) => {
          if (product.quantity === 0) {
            product.message = "Hết hàng.";
          }
        });

        result.push({
          storeName: store.storeName,
          store_id: store._id,
          products: productsWithQuantity,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm cửa hàng:", error);
    res.status(500).json({ error: "Lỗi server." });
  }
};

exports.getListStoreHaveProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Truy vấn MongoDB để lấy thông tin các cửa hàng có sản phẩm với productID tương ứng và số lượng lớn hơn 0
    const productStores = await ProductInStore.find({
      product_id: productId,
      quantity: { $gt: 0 },
    });

    // Tạo một mảng chứa thông tin các cửa hàng
    let storesInfo = [];

    // Duyệt qua từng cửa hàng và lấy thông tin của cửa hàng từ cơ sở dữ liệu
    for (const productStore of productStores) {
      const storeInfo = await Store.findById(productStore.store_id);
      if (storeInfo) {
        storesInfo.push({
          storeId: storeInfo._id,
          storeName: storeInfo.storeName,
          phone: storeInfo.phone,
          location: storeInfo.location,
          province: storeInfo.province,
          district: storeInfo.district,
          quantity: productStore.quantity,
        });
      }
    }

    // Trả về thông tin của các cửa hàng nếu có
    if (storesInfo.length > 0) {
      res.json({ success: true, stores: storesInfo });
    } else {
      res.json({
        success: false,
        message: "Không có cửa hàng nào còn hàng cho sản phẩm này.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin cửa hàng.",
    });
  }
};
