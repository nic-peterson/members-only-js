const Message = require("../../models/message");
const pool = require("../../db/pool");

// Mock the pool
jest.mock("../../db/pool", () => ({
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

describe("Message Model", () => {
  let mockClient;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  describe("create", () => {
    it("should create a new message", async () => {
      const mockMessage = {
        id: 1,
        title: "Test Message",
        content: "Test Content",
        author_id: 1,
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockMessage] });

      const result = await Message.create("Test Message", "Test Content", 1);

      expect(result).toEqual(mockMessage);
      expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), [
        "Test Message",
        "Test Content",
        1,
      ]);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return all messages", async () => {
      const mockMessages = [
        { id: 1, title: "Test Message", content: "Test Content", author_id: 1 },
      ];
      mockClient.query.mockResolvedValueOnce({ rows: mockMessages });
      const result = await Message.findAll();
      expect(result).toEqual(mockMessages);
    });

    it("should return an empty array if no messages are found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findAll();
      expect(result).toEqual([]);
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);
      await expect(Message.findAll()).rejects.toThrow("Database error");
    });

    it("should handle undefined rows property", async () => {
      mockClient.query.mockResolvedValueOnce({}); // Return object without rows property
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
      mockClient.query.mockResolvedValueOnce({ rows: [mockMessage] });
      const result = await Message.findById(1);
      expect(result).toEqual(mockMessage);
    });

    it("should return null if message is not found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findById(999);
      expect(result).toBeNull();
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);
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
      mockClient.query.mockResolvedValueOnce({ rows: [mockDeletedMessage] });
      const result = await Message.delete(1);
      expect(result).toEqual(mockDeletedMessage);
      expect(mockClient.query).toHaveBeenCalledWith(
        "DELETE FROM messages WHERE id = $1 RETURNING *",
        [1]
      );
    });

    it("should return null if message is not found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.delete(999);
      expect(result).toBeNull();
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);
      await expect(Message.delete(1)).rejects.toThrow("Database error");
    });
  });

  describe("findByAuthorId", () => {
    it("should return messages by author id", async () => {
      const mockMessages = [
        { id: 1, title: "Test Message", content: "Test Content", author_id: 1 },
      ];
      mockClient.query.mockResolvedValueOnce({ rows: mockMessages });
      const result = await Message.findByAuthorId(1);
      expect(result).toEqual(mockMessages);
    });

    it("should return an empty array if no messages are found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      const result = await Message.findByAuthorId(999);
      expect(result).toEqual([]);
    });

    it("should handle undefined rows property", async () => {
      mockClient.query.mockResolvedValueOnce({}); // Return object without rows property
      const result = await Message.findByAuthorId(1);
      expect(result).toEqual([]);
    });
  });
});
