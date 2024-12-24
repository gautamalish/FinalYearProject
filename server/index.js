const express = require("express");
require("dotenv").config();
const app = express();
const conn = require("./conn/db");

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Initial Request");
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
