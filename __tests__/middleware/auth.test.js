const {
  ensureAuthenticated,
  ensureAdmin,
  ensureMember,
} = require("../../middleware/auth");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks for each test
    req = {
      isAuthenticated: jest.fn(),
      user: null, // Start with no user
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  describe("ensureAuthenticated", () => {
    it("should call next if user is authenticated", () => {
      req.isAuthenticated.mockReturnValue(true);
      ensureAuthenticated(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should redirect to login if user is not authenticated", () => {
      req.isAuthenticated.mockReturnValue(false);
      ensureAuthenticated(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("ensureAdmin", () => {
    it("should call next if user is admin", () => {
      req.isAuthenticated.mockReturnValue(true);
      req.user = { is_admin: true };
      ensureAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should redirect to upgrade if user is not admin", () => {
      req.user = { is_admin: false };
      ensureAdmin(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/upgrade/admin");
    });

    it("should redirect to login if no user", () => {
      req.user = null;
      ensureAdmin(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/upgrade/admin");
    });
  });

  describe("ensureMember", () => {
    it("should call next if user is member", () => {
      req.isAuthenticated.mockReturnValue(true);
      req.user = { is_member: true };
      ensureMember(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should redirect to upgrade if user is not member", () => {
      req.user = { is_member: false };
      ensureMember(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/upgrade/member");
    });

    it("should redirect to login if no user", () => {
      req.user = null;
      ensureMember(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/upgrade/member");
    });
  });
  // Similar tests for ensureAdmin and ensureMember
});
