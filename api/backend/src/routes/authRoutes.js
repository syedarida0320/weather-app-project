const express= require ("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser,googleLoginUser } = require ("../controllers/authController.js");
const verifyFirebaseToken= require ("../middlewares/authMiddleware.js");
const validateRequest= require("../middlewares/validateRequest.js");
const { registerSchema } = require("../requests/register.schema.js");
const { loginSchema } = require("../requests/login.schema.js");


router.post("/register",validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", verifyFirebaseToken,logoutUser);
router.post("/google-login", googleLoginUser);

module.exports = router;
