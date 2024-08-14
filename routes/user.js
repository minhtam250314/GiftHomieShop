var express = require("express");
const passport = require("passport");
var router = express.Router();
const { verifyToken } = require("../authenticate");
const userController = require("../controllers/userController");
const authenticateJWT = passport.authenticate("jwt", { session: false });

// router.post("/upload", upload.single("image"), userController.uploadImg);
router.post("/login", userController.postLoginUser);
router.post("/register", userController.postAddUser);
router.get("/fetchMe", verifyToken, userController.fetchMe);
router.get("/userid/:userid", userController.getUserById);
router.get("/username/:userName", userController.getUserByUsername);
router.get("/role/:role", userController.getUserByRole);
router.put("/update-user/:userId", userController.updateUserByID);
router.get("/", userController.getAllUser);
module.exports = router;
