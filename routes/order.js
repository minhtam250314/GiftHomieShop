const express = require("express");
const passport = require("passport");
const orderController = require("../controllers/orderController");

const router = express.Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/buyProduct", authenticateJWT, orderController.buyProduct);

router.post("/payOrder", authenticateJWT, orderController.payOrder);

router.get(
  "/responseSucessPayPal",
  // authenticateJWT,
  orderController.responseSucessPayPal
);

router.get(
  "/responseCancelPayPal",
  // authenticateJWT,
  orderController.responseCancelPayPal
);

router.post("/addToCart", authenticateJWT, orderController.addToCart);

router.get(
  "/getListOrder/:userId",
  authenticateJWT,
  orderController.getListOrder
);

router.put(
  "/updateOrder/:orderId",
  authenticateJWT,
  orderController.updateOrder
);

router.delete(
  "/deleteOrder/:orderId",
  authenticateJWT,
  orderController.deleteOrder
);

router.get("/getHistory/:userId", authenticateJWT, orderController.getHistory);

router.get(
  "/getWaitingAcceptOrder/:userId",
  authenticateJWT,
  orderController.getWaitingAcceptOrder
);

router.get(
  "/getWaitingDeliveryOrder/:userId",
  authenticateJWT,
  orderController.getWaitingDeliveryOrder
);

router.get(
  "/getSuccessDeliveryOrder/:userId",
  authenticateJWT,
  orderController.getSuccessDeliveryOrder
);

router.get(
  "/getAccecptedOrder/:userId",
  authenticateJWT,
  orderController.getAccecptedOrder
);

router.get(
  "/getOrderByOrderId/:orderId",
  authenticateJWT,
  orderController.getOrderByOrderId
);

module.exports = router;
