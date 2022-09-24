require("dotenv").config({ path: "./.env" });

const express = require("express");
const logger = require("morgan");

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

app.use("/")