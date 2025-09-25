const express = require("express");
const {
  addCity,
  getCities,
  removeCity,
  setDefaultCity,
} = require("../controllers/citiesController");
const verifyFirebaseToken = require("../middlewares/authMiddleware");

const router = express.Router();

// all routes protected
router.get("/", verifyFirebaseToken, getCities);
router.post("/", verifyFirebaseToken, addCity);
router.delete("/:id", verifyFirebaseToken, removeCity);
router.patch("/:id/default", verifyFirebaseToken, setDefaultCity);

module.exports = router;
