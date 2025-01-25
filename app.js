require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const indexRouter = require("./routes/index");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
