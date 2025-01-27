const express = require("express");
const router = express.Router();
const upgradeController = require("../controllers/upgradeController");
const { ensureAuthenticated, ensureMember } = require("../middleware/auth");

// Member upgrade - requires authentication only
router.get("/member", ensureAuthenticated, upgradeController.getMemberUpgrade);
router.post("/member", ensureAuthenticated, upgradeController.upgradeMember);

// Admin upgrade - requires member status
router.get("/admin", ensureMember, upgradeController.getAdminUpgrade);
router.post("/admin", ensureMember, upgradeController.upgradeAdmin);

module.exports = router;
