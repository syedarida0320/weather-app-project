require("dotenv").config();
const express = require("express");
const cors = require("cors");
const weatherRoutes = require("./routes/weatherRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const colors = require("colors");
const citiesRoutes= require ("./routes/citiesRoutes.js")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/cities", citiesRoutes)

app.get("/", (req, res) => {
  res.send("Hello! Your backend is working fine");
});

app.listen(PORT, () => {
  console.log(colors.bgGreen(`Backend running at http://localhost:${PORT}`));
});
