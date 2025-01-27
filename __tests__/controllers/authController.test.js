const authController = require("../../controllers/authController");

describe("authController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      logout: jest.fn((callback) => callback()),
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  describe("getLogin", () => {
    it("should render login page", () => {
      authController.getLogin(req, res);
      expect(res.render).toHaveBeenCalledWith("auth/login");
    });
  });

  describe("logout", () => {
    it("should logout and redirect to home", () => {
      authController.logout(req, res, next);
      expect(req.logout).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should call next with error if logout fails", () => {
      const error = new Error("Logout failed");
      req.logout = jest.fn((callback) => callback(error));

      authController.logout(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
