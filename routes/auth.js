const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Successfully logged in!");
    res.redirect("/");
  }
);

router.get("/logout", authController.logout);

module.exports = router;
