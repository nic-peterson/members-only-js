const Message = require("../../models/message");
const { Client } = require("pg");

// Mock the pg Client
jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe("Message Model", () => {
  let client;

  beforeEach(() => {
    client = new Client();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new message", async () => {
      const mockMessage = {
        id: 1,
        title: "Test Message",
        content: "Test Content",
        author_id: 1,
      };
      client.query.mockResolvedValueOnce({ rows: [mockMessage] });
      const result = await Message.create("Test Message", "Test Content", 1);
      expect(result).toEqual(mockMessage);
    });
  });

  describe("findAll", () => {
    it("should return all messages", async () => {
      const mockMessages = [
        { id: 1, title: "Test Message", content: "Test Content", author_id: 1 },
      ];
      client.query.mockResolvedValueOnce({ rows: mockMessages });
      const result = await Message.findAll();
      expect(result).toEqual(mockMessages);
    });

    it("should return an empty array if no messages are found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findAll();
      expect(result).toEqual([]);
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      client.query.mockRejectedValueOnce(error);
      await expect(Message.findAll()).rejects.toThrow("Database error");
    });

    it("should handle undefined rows property", async () => {
      client.query.mockResolvedValueOnce({}); // Return object without rows property
      const result = await Message.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return a message by id", async () => {
      const mockMessage = {
        id: 1,
        title: "Test Message",
        content: "Test Content",
        author_id: 1,
      };
      client.query.mockResolvedValueOnce({ rows: [mockMessage] });
      const result = await Message.findById(1);
      expect(result).toEqual(mockMessage);
    });

    it("should return null if message is not found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findById(999);
      expect(result).toBeNull();
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      client.query.mockRejectedValueOnce(error);
      await expect(Message.findById(1)).rejects.toThrow("Database error");
    });
  });

  describe("delete", () => {
    it("should delete a message by id", async () => {
      const mockDeletedMessage = {
        id: 1,
        title: "Test Message",
        content: "Test Content",
        author_id: 1,
      };
      client.query.mockResolvedValueOnce({ rows: [mockDeletedMessage] });
      const result = await Message.delete(1);
      expect(result).toEqual(mockDeletedMessage);
      expect(client.query).toHaveBeenCalledWith(
        "DELETE FROM messages WHERE id = $1 RETURNING *",
        [1]
      );
    });

    it("should return null if message is not found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.delete(999);
      expect(result).toBeNull();
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      client.query.mockRejectedValueOnce(error);
      await expect(Message.delete(1)).rejects.toThrow("Database error");
    });
  });

  describe("findByAuthorId", () => {
    it("should return messages by author id", async () => {
      const mockMessages = [
        { id: 1, title: "Test Message", content: "Test Content", author_id: 1 },
      ];
      client.query.mockResolvedValueOnce({ rows: mockMessages });
      const result = await Message.findByAuthorId(1);
      expect(result).toEqual(mockMessages);
    });

    it("should return an empty array if no messages are found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findByAuthorId(999);
      expect(result).toEqual([]);
    });

    it("should handle undefined rows property", async () => {
      client.query.mockResolvedValueOnce({}); // Return object without rows property
      const result = await Message.findByAuthorId(1);
      expect(result).toEqual([]);
    });
  });
});
