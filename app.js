require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const indexRouter = require("./routes/index");
const signupRouter = require("./routes/signup");
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/signup", signupRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
