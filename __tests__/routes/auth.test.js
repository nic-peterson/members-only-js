// auth.test.js

const request = require("supertest");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const router = require("../../routes/auth");

// Mock passport at the top
jest.mock("passport", () => ({
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next(),
  authenticate: () => (req, res, next) => {
    req.user = { id: 1, username: "testuser" };
    next();
  },
}));

// Create Express app for testing
const app = express();
app.set("view engine", "ejs");

// Consolidate all mocks in one middleware
app.use((req, res, next) => {
  req.flash = jest.fn();
  req.logout = (cb) => cb();
  next();
});

app.use(session({ secret: "test", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);

let renderSpy;

describe("Auth Routes", () => {
  beforeEach(() => {
    renderSpy = jest
      .spyOn(app.response, "render")
      .mockImplementation(function (view) {
        this.send(view); // End the response so that the request does not hang
      });
  });

  afterEach(() => {
    renderSpy.mockRestore();
  });

  describe("GET /login", () => {
    it("should render login page", async () => {
      await request(app).get("/login");
      expect(renderSpy).toHaveBeenCalledWith("auth/login");
    });
  });

  describe("POST /login", () => {
    it("should authenticate and redirect on success", async () => {
      await request(app)
        .post("/login")
        .send({ username: "test@test.com", password: "password" })
        .expect(302)
        .expect("Location", "/");
    });
  });

  describe("GET /logout", () => {
    it("should logout and redirect", async () => {
      await request(app).get("/logout").expect(302).expect("Location", "/");
    });
  });
});
