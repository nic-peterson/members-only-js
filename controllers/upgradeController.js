const User = require("../models/user");

const upgradeController = {
  getMemberUpgrade: (req, res) => {
    res.render("upgrade/member");
  },

  upgradeMember: async (req, res) => {
    try {
      if (req.body.code !== process.env.MEMBER_CODE) {
        return res.render("upgrade/member", {
          error: "Invalid member code",
        });
      }

      await User.setMembershipStatus(req.user.username, true);
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.render("upgrade/member", {
        error: "Error upgrading to member",
      });
    }
  },

  getAdminUpgrade: (req, res) => {
    res.render("upgrade/admin");
  },

  upgradeAdmin: async (req, res) => {
    try {
      if (req.body.code !== process.env.ADMIN_CODE) {
        return res.render("upgrade/admin", {
          error: "Invalid admin code",
        });
      }

      await User.setAdminStatus(req.user.username, true);
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.render("upgrade/admin", {
        error: "Error upgrading to admin",
      });
    }
  },
};

module.exports = upgradeController;
