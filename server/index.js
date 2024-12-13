const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Initial Request");
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
