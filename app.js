// app.js
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 3000;
const flash = require("express-flash");
const setup = require("./db/setup");

// Import routes
const indexRouter = require("./routes/index");
const signupRouter = require("./routes/signup");
const authRouter = require("./routes/auth");
const upgradeRouter = require("./routes/upgrade");

app.set("view engine", "ejs"); // Set EJS as the default view engine
app.set("views", "./views"); // Optional: Specify the directory for your view templates

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Add this before passport middleware

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Add right before your routes
app.use(async (req, res, next) => {
  try {
    // Run database setup
    await setup();
    next();
  } catch (error) {
    console.error("Database setup error:", error);
    next(error);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/", indexRouter);
app.use("/signup", signupRouter);
app.use("/", authRouter); // Add auth routes
app.use("/upgrade", upgradeRouter); // Add upgrade routes

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
