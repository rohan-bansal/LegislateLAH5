require("dotenv").config({ path: "./.env" });

const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
var fs = require("fs");
const execSync = require("node:child_process").execSync;

const app = express();
const PORT = process.env.PORT || 4000;

let setCache = function (req, res, next) {
  if (req.method == "GET") {
    res.set("Cache-control", `no-cache`);
  } else {
    res.set("Cache-control", `no-store`);
  }
  next();
};

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(8000, () => {
  console.log("socket listening on *:8000");
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  })
);

app.use(setCache);

app.post("/api/retrieveStancesByLegislator", async function (req, res) {
  totalObjs = [];

  links = [
    "https://justfacts.votesmart.org/bill/17780/47474/authorizes-individuals-without-concealed-carry-licenses-to-carry-firearms-in-vehicles",
    "https://justfacts.votesmart.org/bill/30549/78842/prohibits-state-and-local-governments-from-enforcing-any-federal-firearms-act",
  ];

  links.forEach((link) => {
    resObj = {};
    var obj2 = JSON.parse(fs.readFileSync("./data/Gunsbillref.json", "utf8"));
    resObj["link"] = link;
    resObj["name"] = obj2[link]["name"];
    resObj["synopsis"] = obj2[link]["synopsis"];

    let argument = obj2[link]["pg"];
    // const result =
    // console.log(result, result.toString("ascii"));
    resObj["prediction"] = execSync("python3 predict.py", [
      "-c",
      `import predict; predict.predict("${argument}");`,
    ]);
    totalObjs = [...totalObjs, resObj];
  });

  console.log(totalObjs);
  res.send(totalObjs);
});

app.listen(PORT, function () {
  console.log(`Node server listening at http://localhost:${PORT} 🚀`);
});

module.exports = app;
