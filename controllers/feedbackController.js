const Order = require("../models/Order");
const Feedback = require("../models/Feedback");
const Delivery = require("../models/Delivery");

exports.addFeedback = async (req, res) => {
  try {
    const { userId, orderId, productId, content, rating } = req.body;

    // Cập nhật trạng thái của delivery thành "Đã đánh giá"
    await Delivery.updateOne({ order_id: orderId }, { status: "Đã xác nhận" });

    // Tạo bình luận mới
    const newFeedback = new Feedback({
      user_id: userId,
      product_id: productId,
      content,
      rating,
    });
    await newFeedback.save();

    res.status(201).json({ message: "Bình luận được thêm thành công." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { user_id } = req.body;
    const feedbackId = req.params.feedbackId;

    // Kiểm tra xem feedback tồn tại và được tạo bởi user_id
    const feedback = await Feedback.findOne({ _id: feedbackId, user_id });
    if (!feedback) {
      return res.status(404).json({
        error: "Không tìm thấy feedback hoặc bạn không có quyền chỉnh sửa.",
      });
    }

    // Cập nhật nội dung và điểm đánh giá của feedback
    feedback.content = req.body.content;
    feedback.updateTime = Date.now();

    const updatedFeedback = await feedback.save();
    res.json({
      message: "Feedback đã được cập nhật thành công.",
      feedback: updatedFeedback,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const productId = req.params.productId;

    const feedbacks = await Feedback.find({ product_id: productId }).populate(
      "user_id"
    );

    const feedbacksWithUserName = feedbacks.map((feedback) => {
      return {
        content: feedback.content,
        rating: feedback.rating,
        timestamp: feedback.timestamp,
        updateTime: feedback.updateTime,
        userName: feedback.user_id.username,
      };
    });

    if (feedbacksWithUserName.length > 0) {
      res.json({ success: true, feedbacks: feedbacksWithUserName });
    } else {
      res.json({
        success: false,
        message: "Không có feedback cho sản phẩm này.",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Đã xảy ra lỗi khi lấy feedback." });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Sử dụng aggregation để tính toán rating trung bình
    const result = await Feedback.aggregate([
      { $match: { product_id: productId } }, // Lọc theo product_id
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }, // Tính trung bình rating
    ]);

    // Nếu không có đánh giá nào, trả về rating trung bình là 0
    const averageRating = result.length > 0 ? result[0].avgRating : 0;

    res.json({ averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
