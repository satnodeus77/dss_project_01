const express = require("express");
const { calculateSAW } = require("../controllers/saw");
const { calculateWP } = require("../controllers/wp");
const { calculateTOPSIS } = require("../controllers/topsis");

const router = express.Router();

router.post("/saw", (req, res) => res.json(calculateSAW(req.body.criteria, req.body.alternatives)));
router.post("/wp", (req, res) => res.json(calculateWP(req.body.criteria, req.body.alternatives)));
router.post("/topsis", (req, res) => res.json(calculateTOPSIS(req.body.criteria, req.body.alternatives)));

module.exports = router;
