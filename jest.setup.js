jest.mock("./src/sql/mysqlConnection.js", () => ({
  getConnection: jest.fn((cb) => cb(null, { release: jest.fn() })),
}));
