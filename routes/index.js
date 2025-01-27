const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const { ensureAdmin, ensureAuthenticated } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const messages = await Message.findAll();
    console.log("Current user:", req.user); // Debug line
    res.render("index", {
      messages, // Keep existing messages functionality
      flashMessages: req.flash(), // Add flash messages separately
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.render("index", {
      messages: [], // Fallback empty messages
      flashMessages: req.flash(),
    });
  }
});

// Add delete route with admin middleware
router.post("/messages/:id/delete", ensureAdmin, async (req, res) => {
  try {
    await Message.delete(req.params.id);
    req.flash("success", "Message deleted successfully");
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Error deleting message");
    res.redirect("/");
  }
});

// New message form
router.get("/messages/new", ensureAuthenticated, (req, res) => {
  res.render("messages/new");
});

// Create message
router.post("/messages", ensureAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    await Message.create(title, content, req.user.id);
    req.flash("success", "Message created successfully!");
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    res.render("messages/new", { error: "Error creating message" });
  }
});

module.exports = router;
