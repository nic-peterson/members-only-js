// Setup mock before requiring pg
const mockPool = jest.fn();
jest.mock("pg", () => ({
  Pool: mockPool,
}));

// Now require pg
require("pg");

describe("Database Pool", () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.DATABASE_URL = "postgresql://test:test@localhost/testdb";
    mockPool.mockClear();
    delete require.cache[require.resolve("../../db/pool")];
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("should configure SSL for production", () => {
    process.env.NODE_ENV = "production";
    require("../../db/pool");
    expect(mockPool).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  });
});
