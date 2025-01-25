// signupController.test.js
const signupController = require("../../controllers/signupController");
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

// Mock dependencies
jest.mock("../../models/user");
jest.mock("bcrypt");

describe("signupController", () => {
  let req, res;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        username: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should render the signup form", () => {
    req = {};
    res = { render: jest.fn() };
    signupController.getSignup(req, res);
    expect(res.render).toHaveBeenCalledWith("signup");
  });

  describe("validateSignup", () => {
    it("should pass validation when all fields are valid", async () => {
      const req = {
        body: {
          firstName: "John",
          lastName: "Doe",
          username: "john@example.com",
          password: "password123",
          confirmPassword: "password123",
        },
      };
      const next = jest.fn();

      // Run all validation middleware
      for (const validator of signupController.validateSignup) {
        await validator(req, res, next);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBeTruthy();
      expect(next).toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const req = {
        body: { firstName: "" }, // Empty required field
      };
      const next = jest.fn();
      await signupController.validateSignup[0](req, res, next);
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBeFalsy();
    });

    it("should validate email format", async () => {
      req.body.username = "invalid-email";
      await signupController.validateSignup[2](req, res, () => {});
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBeFalsy();
    });

    it("should validate password length", async () => {
      req.body.password = "123";
      await signupController.validateSignup[3](req, res, () => {});
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBeFalsy();
    });

    it("should validate password match", async () => {
      req.body.confirmPassword = "different";
      await signupController.validateSignup[4](req, res, () => {});
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBeFalsy();
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({ id: 1 });

      await signupController.createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith(
        "john@example.com",
        "hashedPassword",
        "John",
        "Doe"
      );
      expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("should handle database errors", async () => {
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.create.mockRejectedValue(new Error("Database error"));

      await signupController.createUser(req, res);

      expect(res.render).toHaveBeenCalledWith("signup", {
        errors: [{ msg: "Error creating account" }],
        user: req.body,
      });
    });

    // Add this test for validation errors (line 24)
    it("should handle validation errors and return rendered signup page", async () => {
      // Mock validationResult to return errors
      const mockValidationResult = {
        isEmpty: () => false,
        array: () => [{ msg: "Error creating account" }],
      };
      require("express-validator").validationResult = jest.fn(
        () => mockValidationResult
      );

      await signupController.createUser(req, res);

      expect(res.render).toHaveBeenCalledWith("signup", {
        errors: [{ msg: "Error creating account" }],
        user: {
          firstName: "John",
          lastName: "Doe",
          username: "john@example.com",
          password: "password123",
          confirmPassword: "password123",
        },
      });
    });

    // Add this test for successful validation (line 34)
    it("should proceed when validation passes", async () => {
      // Mock validationResult to return no errors
      const mockValidationResult = {
        isEmpty: () => true,
        array: () => [],
      };
      require("express-validator").validationResult = jest.fn(
        () => mockValidationResult
      );

      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({ id: 1 });

      await signupController.createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(User.create).toHaveBeenCalledWith(
        "john@example.com",
        "hashedPassword",
        "John",
        "Doe"
      );
      expect(res.redirect).toHaveBeenCalledWith("/");
    });
  });
});
