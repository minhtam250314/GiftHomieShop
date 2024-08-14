const express = require("express");
// const passport = require("passport");
const categoryController = require("../controllers/categoryController");

const router = express.Router();
// const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/addCategory", 
// authenticateJWT, 
categoryController.addCategory);

router.get("/getCategory", 
// authenticateJWT, 
categoryController.getCategory);

module.exports = router;