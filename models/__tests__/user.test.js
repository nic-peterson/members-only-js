const User = require("../user");
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

describe("User Model", () => {
  let client;

  beforeEach(() => {
    // Get the mocked client instance
    client = new Client();
    // Clear all mock data before each test
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      // Mock the query response
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
        first_name: "Test",
        last_name: "User",
        is_member: false,
        is_admin: false,
        membership_updated_at: null,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      client.query.mockResolvedValueOnce({ rows: [mockUser] });

      // Call the create method
      const result = await User.create(
        "testuser",
        "hashedpassword",
        "Test",
        "User"
      );

      // Verify the query was called with correct parameters
      expect(client.connect).toHaveBeenCalled();
      expect(client.query).toHaveBeenCalledWith(
        "INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
        ["testuser", "hashedpassword", "Test", "User"]
      );
      expect(client.end).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          username: "testuser",
          password: "hashedpassword",
          first_name: "Test",
          last_name: "User",
          is_member: false,
          is_admin: false,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        })
      );
    });

    it("should throw an error if database query fails", async () => {
      // Mock a database error
      const error = new Error("Database error");
      client.query.mockRejectedValueOnce(error);

      // Verify the error is thrown
      await expect(User.create("testuser", "password")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByUsername", () => {
    it("should find a user by username", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
      };
      client.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findByUsername("testuser");

      expect(client.connect).toHaveBeenCalled();
      expect(client.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE username = $1",
        ["testuser"]
      );
      expect(client.end).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findByUsername("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const mockUser = { id: 1, username: "testuser" };
      client.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(client.connect).toHaveBeenCalled();
      expect(client.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [1]
      );
      expect(client.end).toHaveBeenCalled();
      expect(client.end).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      client.query.mockResolvedValueOnce({ rows: [] });

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
      client.query.mockResolvedValueOnce({ rows: [mockUserTrue] });
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

      client.query.mockResolvedValueOnce({ rows: [mockUserFalse] });
      const result = await User.isMember("nonexistent");
      expect(result).toBe(false);
    });

    it("should throw an error if database query fails", async () => {
      const error = new Error("Database error");
      client.query.mockRejectedValueOnce(error);
      await expect(User.isMember("testuser")).rejects.toThrow("Database error");
    });
  });

  describe("setMembershipStatus", () => {
    it("should update the membership status of a user", async () => {
      await User.setMembershipStatus("testuser", true);
      expect(client.query).toHaveBeenCalledWith(
        "UPDATE users SET is_member = $1 WHERE username = $2",
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
      client.query.mockResolvedValueOnce({ rows: [mockUserTrue] });
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
      client.query.mockResolvedValueOnce({ rows: [mockUserFalse] });
      const result = await User.isAdmin("testuser");
      expect(result).toBe(false);
    });
  });

  describe("setAdminStatus", () => {
    it("should update the admin status of a user", async () => {
      await User.setAdminStatus("testuser", true);
      expect(client.query).toHaveBeenCalledWith(
        "UPDATE users SET is_admin = $1 WHERE username = $2",
        [true, "testuser"]
      );
    });
  });
});
