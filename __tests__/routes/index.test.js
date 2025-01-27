const request = require("supertest");
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const router = require("../../routes/index");
const Message = require("../../models/message");
const { ensureAdmin, ensureAuthenticated } = require("../../middleware/auth");

// Mock dependencies
jest.mock("../../models/message");
jest.mock("../../middleware/auth");

const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use(session({ secret: "test", resave: false, saveUninitialized: false }));
app.use(flash());

// Add user middleware before router
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

app.use("/", router);

// Mock render and flash
app.use((req, res, next) => {
  req.flash = jest.fn();
  res.render = jest.fn();
  next();
});

describe("Index Routes", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
    ensureAuthenticated.mockImplementation((req, res, next) => next());
    ensureAdmin.mockImplementation((req, res, next) => next());
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe("GET /", () => {
    it("should render index with messages", async () => {
      const mockMessages = [{ id: 1, title: "Test" }];
      Message.findAll.mockResolvedValue(mockMessages);

      const res = await request(app).get("/");
      expect(res.status).toBe(200);
    });

    it("should handle errors", async () => {
      Message.findAll.mockRejectedValue(new Error("DB Error"));

      const res = await request(app).get("/");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /messages/:id/delete", () => {
    it("should delete message and redirect", async () => {
      Message.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).post("/messages/1/delete");

      expect(Message.delete).toHaveBeenCalledWith("1");
      expect(res.status).toBe(302);
    });

    it("should handle delete errors", async () => {
      Message.delete.mockRejectedValue(new Error("Delete failed"));

      const res = await request(app).post("/messages/1/delete");

      expect(res.status).toBe(302);
    });
  });

  describe("GET /messages/new", () => {
    it("should render new message form", async () => {
      const res = await request(app).get("/messages/new");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /messages", () => {
    it("should create new message and redirect", async () => {
      const mockMessage = { title: "Test", content: "Content" };
      Message.create.mockResolvedValue(mockMessage);

      const res = await request(app).post("/messages").send(mockMessage);

      expect(Message.create).toHaveBeenCalledWith(
        mockMessage.title,
        mockMessage.content,
        1
      );
      expect(res.status).toBe(302);
    });

    it("should handle creation errors", async () => {
      Message.create.mockRejectedValue(new Error("Creation failed"));

      const res = await request(app)
        .post("/messages")
        .send({ title: "Test", content: "Content" });

      expect(res.status).toBe(200);
    });
  });
});
