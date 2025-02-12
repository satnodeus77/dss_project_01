const express = require("express");
const { User } = require("../models");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/login", verifyToken, async (req, res) => {
  const { uid, name, email } = req.user;
  let user = await User.findOne({ where: { uid } });

  if (!user) {
    user = await User.create({ uid, name, email });
  }

  res.json(user);
});

module.exports = router;
