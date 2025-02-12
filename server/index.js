const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./models");
const authRoutes = require("./routes/authRoutes");
const calcRoutes = require("./routes/calcRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build"))); 

app.use("/api/auth", authRoutes);
app.use("/api/calculate", calcRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});
