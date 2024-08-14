const express = require("express");
const passport = require("passport");
const storeController = require("../controllers/storeController");
const router = express.Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/getAllStore", storeController.getAllStore);
router.post("/addStore", storeController.addStore);
router.get("/getStoreByLocation", storeController.getStoreByLocation);
router.get("/getStoreByID/:storeId", storeController.getStoreByID);
router.put("/updateStoreByID/:storeId", storeController.updateStoreByID);
router.delete("/deleteStoreByID/:storeId", storeController.deleteStoreByID);
router.get("/getLocationStore", storeController.getLocationStore);

module.exports = router;
