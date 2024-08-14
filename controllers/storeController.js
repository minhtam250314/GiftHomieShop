const Store = require("../models/Store");

exports.getAllStore = (req, res, next) => {
  Store.find({})
    .then((stores) => {
      if (!stores || stores.length === 0) {
        // Chỉ trả về thông báo với mã 404 mà không ném lỗi
        res.status(404).json({ message: "No active store found" });
      } else {
        // Cửa hàng tồn tại, trả về danh sách cửa hàng
        res.status(200).json(stores);
      }
    })
    .catch((err) => {
      // Xử lý lỗi khi truy vấn MongoDB gặp vấn đề
      next(err);
    });
};

exports.addStore = (req, res, next) => {
  Store.create(req.body)
    .then(
      (store) => {
        console.log("Store Created ", store);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(store);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getStoreByID = (req, res, next) => {
  Store.findById(req.params.storeId)
    .then(
      (store) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(store);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.updateStoreByID = (req, res, next) => {
  Store.findByIdAndUpdate(
    req.params.storeId,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then(
      (store) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(store);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.deleteStoreByID = (req, res, next) => {
  Store.findByIdAndDelete(req.params.storeId)
    .then(
      (resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
exports.getStoreByLocation = (req, res, next) => {
  const query = {};
  const { province, district } = req.query;
  if (province) query.province = province;
  if (district) query.district = district;

  // Check if at least one query parameter is provided
  if (!province && !district) {
    res.status(400).json({
      error:
        "No search parameters provided. Please specify a province or district.",
    });
    return;
  }
  console.log(query);
  Store.find(query)
    .then((stores) => {
      if (!stores || stores.length === 0) {
        return res
          .status(404)
          .json({ message: "No stores found matching the criteria." });
      }
      res.status(200).json(stores);
    })
    .catch((err) => next(err));
};

exports.getLocationStore = async (req, res) => {
  try {
    const distinctProvinces = await Store.distinct("province");
    const provincesAndDistricts = []; 

    for (const province of distinctProvinces) {
      const districts = await Store.distinct("district", { province: province });
      provincesAndDistricts.push({ province, districts });
    }

    res.json(provincesAndDistricts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
