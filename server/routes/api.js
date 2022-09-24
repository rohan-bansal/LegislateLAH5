var express = require("express");
var fs = require("fs");

const router = express.Router();

router.post("/retrieveStancesByLegislator", function (req, res) {
  var obj = JSON.parse(fs.readFileSync("./bills/Tariffs/result.json", "utf8"));

  res.send(obj);
});

router.post("/retrieveLegislatorsByDistrict", function (req, res) {});

router.post("/retrieveHouseLegislators", function (req, res) {});

router.post("/retrieveSenateLegislators", function (req, res) {});

module.exports = router;
