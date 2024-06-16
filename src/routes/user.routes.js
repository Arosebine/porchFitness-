const express = require("express");
const limiter  = require("../middleware/rateLimit");
const { auth } = require("../middleware/auth");
const userController = require("../controller/user.controller");
const router = express.Router();



router.post("/signup", userController.signUp);
router.post("/login", limiter, userController.userLogin);
router.get("/emailVerify/:token", userController.emailVerify );
router.post("/forgotpassword", userController.forgotPassword );
router.put("/resetpassword",  userController.resetPassword );



module.exports = router;