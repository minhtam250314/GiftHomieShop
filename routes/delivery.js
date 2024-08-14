var express = require("express");
const passport = require("passport");
var router = express.Router();
const { verifyToken } = require("../authenticate");
const deliveryController = require("../controllers/deliveryController");
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/postAddDelivery", deliveryController.postAddDelivery);
router.get("/", deliveryController.getAllDelivery);
router.get("/:deliveryId", deliveryController.getDeliveryById);
router.get("/shipper/:shipperId", deliveryController.getDeliveryByShipperId);
router.get("/order/:orderId", deliveryController.getDeliveryByOrderID);
router.get("/store/:storeId", deliveryController.getDeliveryByStoreId);
router.put(
  "/update-delivery/:deliveryId",
  deliveryController.updateDeliveryByID
);

module.exports = router;
