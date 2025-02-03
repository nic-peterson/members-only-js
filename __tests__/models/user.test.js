const User = require("../../models/user");
const pool = require("../../db/pool");

// Mock the pool
jest.mock("../../db/pool", () => ({
  connect: jest.fn(),
}));

describe("User Model", () => {
  let mockClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock client with query responses
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };

    // Make pool.connect return our mockClient
    pool.connect.mockResolvedValue(mockClient);
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const mockUser = {
        id: 1,
        username: "test@test.com",
        first_name: "Test",
        last_name: "User",
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.create(
        "test@test.com",
        "password",
        "Test",
        "User"
      );

      expect(result).toEqual(mockUser);
      expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), [
        "test@test.com",
        "password",
        "Test",
        "User",
      ]);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should throw an error if database query fails", async () => {
      // Mock a database error
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);

      // Verify the error is thrown
      await expect(User.create("testuser", "password")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByUsername", () => {
    it("should find a user by username", async () => {
      const mockUser = { id: 1, username: "testuser" };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findByUsername("testuser");

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username = $1",
        ["testuser"]
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findByUsername("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const mockUser = { id: 1, username: "testuser" };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [1]
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findById(2);

      expect(result).toBeNull();
    });
  });

  describe("isMember", () => {
    it("should return true if user is a member", async () => {
      const mockUserTrue = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
        is_member: true,
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUserTrue] });
      const result = await User.isMember("testuser");
      expect(result).toBe(true);
    });

    it("should return false if user is not a member", async () => {
      const mockUserFalse = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
        is_member: false,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockUserFalse] });
      const result = await User.isMember("nonexistent");
      expect(result).toBe(false);
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);
      await expect(User.isMember("testuser")).rejects.toThrow("Database error");
    });
  });

  describe("setMembershipStatus", () => {
    it("should update the membership status of a user", async () => {
      await User.setMembershipStatus("testuser", true);
      expect(mockClient.query).toHaveBeenCalledWith(
        "UPDATE users SET is_member = $1 WHERE username = $2 RETURNING *",
        [true, "testuser"]
      );
    });
  });

  describe("isAdmin", () => {
    it("should return true if user is an admin", async () => {
      const mockUserTrue = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
        is_admin: true,
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUserTrue] });
      const result = await User.isAdmin("testuser");
      expect(result).toBe(true);
    });

    it("should return false if user is not an admin", async () => {
      const mockUserFalse = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
        is_admin: false,
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockUserFalse] });
      const result = await User.isAdmin("testuser");
      expect(result).toBe(false);
    });
  });

  describe("setAdminStatus", () => {
    it("should update the admin status of a user", async () => {
      await User.setAdminStatus("testuser", true);
      expect(mockClient.query).toHaveBeenCalledWith(
        "UPDATE users SET is_admin = $1 WHERE username = $2 RETURNING *",
        [true, "testuser"]
      );
    });
  });
});
