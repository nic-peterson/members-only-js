// controllers/signupController.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { body } = require("express-validator");

const signupController = {
  // show signup form
  getSignup: (req, res) => {
    res.render("signup");
  },

  // Define validation rules
  validateSignup: [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("username").trim().isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],

  // Handle signup form submission
  createUser: async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create(
        req.body.username,
        hashedPassword,
        req.body.firstName,
        req.body.lastName
      );

      res.redirect("/");
    } catch (error) {
      console.error("Error:", error);
      res.render("signup", {
        errors: [{ msg: "Error creating account" }],
        user: req.body,
      });
    }
  },
};

module.exports = signupController;
