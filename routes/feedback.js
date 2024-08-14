const express = require("express");
// const passport = require("passport");
const feedbackController = require("../controllers/feedbackController");

const router = express.Router();
// const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post(
  "/addFeedback",
  // authenticateJWT,
  feedbackController.addFeedback
);

router.put(
  "/updateFeedback/:feedbackId",
  // authenticateJWT,
  feedbackController.updateFeedback
);

router.get(
  "/getFeedback/:productId",
  // authenticateJWT,
  feedbackController.getFeedback
);

router.get(
  "/getAverageRating/:productId",
  // authenticateJWT,
  feedbackController.getAverageRating
);

module.exports = router;
