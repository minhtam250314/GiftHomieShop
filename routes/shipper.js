var express = require("express");
const passport = require("passport");
var router = express.Router();
const { verifyToken } = require("../authenticate");
const shipperController = require("../controllers/shipperController");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/postAddShipper", shipperController.postAddShipper);
router.get("/shipperid/:shipperId", shipperController.getShipperById);
router.get("/shippername/:shipperName", shipperController.getShipperByName);
router.get("/store/:storeId", shipperController.getShipperByStore);
router.put("/update-user/:shipperId", shipperController.updateShipperByID);
router.get("/", shipperController.getAllShipper);

module.exports = router;
