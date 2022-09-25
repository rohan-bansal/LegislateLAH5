var express = require("express");
var fs = require("fs");

const router = express.Router();

router.post("/retrieveStancesByLegislator", function (req, res) {
//   var obj = JSON.parse(fs.readFileSync("./bills/Tariffs/result.json", "utf8"));

  res.send("Received " + req.body.name);
});

module.exports = router;
