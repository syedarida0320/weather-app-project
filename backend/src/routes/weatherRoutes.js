const express= require ("express");
const { getWeatherByCoords, getWeatherByCity } = require ("../controllers/weatherControllers.js");
const verifyFirebaseToken=require("../middlewares/authMiddleware.js")

const router = express.Router();

router.get("/coords",verifyFirebaseToken, getWeatherByCoords); 
router.get("/city",verifyFirebaseToken, getWeatherByCity);     
router.get("/public/coords", getWeatherByCoords);
router.get("/public/city", getWeatherByCity);

module.exports= router;
