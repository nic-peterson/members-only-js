const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupController");

router.get("/", signupController.getSignup);
router.post("/", signupController.validateSignup, signupController.createUser);

module.exports = router;
