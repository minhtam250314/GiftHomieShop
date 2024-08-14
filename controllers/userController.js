const User = require("../models/User");
const bcrypt = require("bcrypt");
const authenticate = require("../authenticate");

exports.uploadImg = async (req, res) => {
  try {
    // Kiểm tra xem có file ảnh được tải lên hay không
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Sử dụng thông tin từ đối tượng result trực tiếp
    const imageUrl = req.file.path;

    // Trả về URL của ảnh trên Cloudinary
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllUser = (req, res, next) => {
  User.find({})
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

exports.getUserById = (req, res, next) => {
  const userId = req.params.userid;
  User.findById(userId)
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

exports.getUserByUsername = (req, res, next) => {
  const userName = req.params.userName;
  User.findById({ username: userName })
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

exports.getUserByRole = (req, res, next) => {
  const role = req.params.role;
  User.findById({ role: role })
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

exports.updateUserByID = (req, res, next) => {
  User.findByIdAndUpdate(
    req.params.userId,
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

exports.postLoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    // .populate("role_id");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username và password không chính xác.",
      });
    }

    // Kiểm tra mật khẩu đã hash
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({
          success: false,
          message: "Password không chính xác.",
        });
      }
      // Nếu mật khẩu hợp lệ, tạo mã token và trả về cho người dùng
      const token = authenticate.getToken({ _id: user._id });
      res.status(200).json({
        success: true,
        token: token,
        user: user,
        status: "Bạn đã đăng nhập thành công!",
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.postAddUser = async (req, res, next) => {
  try {
    // Check if username already exists
    const existingUsername = await User.findOne({
      username: req.body.username,
    });
    const existingEmail = await User.findOne({ email: req.body.email });
    const existingPhone = await User.findOne({ phone: req.body.phone });
    if (existingUsername && existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Username and email đã tồn tại." });
    }
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username đã tồn tại." });
    }

    // Check if email already exists

    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại." });
    }
    if (existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone đã tồn tại." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create the user
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      gender: req.body.gender,
      address: req.body.address,
      fullName: req.body.fullName,
      status: req.body.status,
      phone: req.body.phone,
      role: req.body.role,
    });

    // Return success response
    res
      .status(200)
      .json({ success: true, user: user, message: "Registration Successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.fetchMe = async (req, res, next) => {
  const userId = req.decoded._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    console.error("Error finding user:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
