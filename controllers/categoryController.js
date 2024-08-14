const Category = require("../models/Category");

exports.addCategory = (req, res, next) => {
  Category.create(req.body)
    .then(
      (category) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(category);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();

    res.json({ success: true, categories: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
