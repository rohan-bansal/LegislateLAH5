require("dotenv").config({ path: "./.env" });

const express = require("express");
const logger = require("morgan");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(logger("dev"));
app.use(express.json());
