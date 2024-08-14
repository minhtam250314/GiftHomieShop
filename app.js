var createError = require("http-errors");
var express = require("express");
const ejs = require("ejs");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const categoryRouter = require("./routes/category");
const productRouter = require("./routes/product");
const storeRouter = require("./routes/store");

const productInStoreRouter = require("./routes/productInStore");
const feedbackRouter = require("./routes/feedback");
const orderRouter = require("./routes/order");

const shipperRouter = require("./routes/shipper");
const deliveryRouter = require("./routes/delivery");

var app = express();
const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017/GiftHomieShop";
const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "*", // Hoặc '*' để chấp nhận tất cả các origin
  })
);

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/store", storeRouter);

app.use("/productInStore", productInStoreRouter);
app.use("/feedback", feedbackRouter);
app.use("/order", orderRouter);
app.use("/shipper", shipperRouter);
app.use("/delivery", deliveryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
