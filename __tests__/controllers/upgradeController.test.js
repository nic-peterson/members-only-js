const upgradeController = require("../../controllers/upgradeController");
const User = require("../../models/user");

jest.mock("../../models/user");

describe("upgradeController", () => {
  let req, res, consoleErrorSpy;

  beforeEach(() => {
    req = {
      body: {},
      user: { username: "testuser" },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  describe("getMemberUpgrade", () => {
    it("should render member upgrade page", () => {
      upgradeController.getMemberUpgrade(req, res);
      expect(res.render).toHaveBeenCalledWith("upgrade/member");
    });
  });

  describe("upgradeMember", () => {
    it("should upgrade user to member with correct code", async () => {
      process.env.MEMBER_CODE = "secret123";
      req.body.code = "secret123";

      await upgradeController.upgradeMember(req, res);

      expect(User.setMembershipStatus).toHaveBeenCalledWith("testuser", true);
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should show error with incorrect code", async () => {
      process.env.MEMBER_CODE = "secret123";
      req.body.code = "wrong";

      await upgradeController.upgradeMember(req, res);

      expect(res.render).toHaveBeenCalledWith("upgrade/member", {
        error: "Invalid member code",
      });
    });

    // Add this test to cover the error handling
    it("should handle database errors when upgrading member", async () => {
      process.env.MEMBER_CODE = "secret123";
      req.body.code = "secret123";

      // Mock the database error
      User.setMembershipStatus.mockRejectedValue(new Error("Database error"));

      await upgradeController.upgradeMember(req, res);

      expect(res.render).toHaveBeenCalledWith("upgrade/member", {
        error: "Error upgrading to member",
      });
    });
  });

  describe("getAdminUpgrade", () => {
    it("should render admin upgrade page", () => {
      upgradeController.getAdminUpgrade(req, res);
      expect(res.render).toHaveBeenCalledWith("upgrade/admin");
    });

    it("should upgrade user to admin with correct code", async () => {
      process.env.ADMIN_CODE = "admin123";
      req.body.code = "admin123";

      await upgradeController.upgradeAdmin(req, res);

      expect(User.setAdminStatus).toHaveBeenCalledWith("testuser", true);
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should show error with incorrect code", async () => {
      process.env.ADMIN_CODE = "admin123";
      req.body.code = "wrong";

      await upgradeController.upgradeAdmin(req, res);
    });
  });

  describe("upgradeAdmin", () => {
    it("should upgrade user to admin with correct code", async () => {
      process.env.ADMIN_CODE = "admin123";
      req.body.code = "admin123";

      await upgradeController.upgradeAdmin(req, res);

      expect(User.setAdminStatus).toHaveBeenCalledWith("testuser", true);
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should show error with incorrect code", async () => {
      process.env.ADMIN_CODE = "admin123";
      req.body.code = "wrong";

      await upgradeController.upgradeAdmin(req, res);

      expect(res.render).toHaveBeenCalledWith("upgrade/admin", {
        error: "Invalid admin code",
      });
    });

    // Add this test to cover the error handling
    it("should handle database errors when upgrading admin", async () => {
      process.env.ADMIN_CODE = "admin123";
      req.body.code = "admin123";

      // Mock the database error
      User.setAdminStatus.mockRejectedValue(new Error("Database error"));

      await upgradeController.upgradeAdmin(req, res);

      expect(res.render).toHaveBeenCalledWith("upgrade/admin", {
        error: "Error upgrading to admin",
      });
    });
  });
});
