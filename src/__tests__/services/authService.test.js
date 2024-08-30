const validatePassword = require("../../validations/passwordValidation");
const validateEmail = require("../../validations/emailValidation");
const authService = require("../../services/authService");
const bcrypt = require("bcrypt");
const tokenService = require("../../services/tokenService");
const { executeQuery } = require("../../sql/executeQuery");
const queries = require("../../sql/sqlQueries");

jest.mock("../../sql/executeQuery");
jest.mock("bcrypt");
jest.mock("../../services/tokenService");

describe("AuthService", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test to prevent interference
  });

  describe("signup", () => {
    it("should create a new student and return tokens on successful signup", async () => {
      const email = "test@example.com";
      const password = "ValidPassword1"; // Use a valid password for the test
      const hashedPassword = "hashedPassword";
      const newStudentId = 1;

      executeQuery
        .mockResolvedValueOnce([]) // No existing student with this email
        .mockResolvedValueOnce({ insertId: newStudentId }); // Simulate student insertion
      bcrypt.hash.mockResolvedValue(hashedPassword);
      tokenService.generateTokens.mockReturnValue({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      tokenService.saveToken.mockResolvedValue();

      const result = await authService.signup(email, password);

      expect(result).toEqual({
        studentId: newStudentId,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 8);
      expect(executeQuery).toHaveBeenCalledWith(queries.insertStudent, [
        email,
        hashedPassword,
      ]);
    });

    it("should return an error if the email is already in use", async () => {
      const email = "test@example.com";
      const password = "ValidPassword1";

      executeQuery.mockResolvedValue([{ id: 1 }]); // Mock that the email already exists

      const result = await authService.signup(email, password);

      expect(result).toEqual({
        error: "That email is already in use",
        path: "email",
      });
      expect(executeQuery).toHaveBeenCalledWith(queries.getEmail, [email]);
    });

    it("should return an error if the password is invalid", async () => {
      const email = "test@example.com";
      const password = "invalid"; // Invalid password for the test

      executeQuery.mockResolvedValue([]); // Mock that the email does not exist

      const result = await authService.signup(email, password);

      expect(result).toEqual({
        error: "Password must contain at least one digit",
        path: "password",
      });
    });
  });

  describe("login", () => {
    it("should return tokens if the login is successful", async () => {
      const email = "test@example.com";
      const password = "ValidPassword1";
      const hashedPassword = "hashedPassword";
      const studentId = 1;

      // Mock successful database query and bcrypt password comparison
      executeQuery.mockResolvedValue([
        { id: studentId, password: hashedPassword },
      ]);
      bcrypt.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockReturnValue({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      tokenService.saveToken.mockResolvedValue();

      const result = await authService.login(email, password);

      expect(result).toEqual({
        studentId,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(tokenService.saveToken).toHaveBeenCalledWith(
        studentId,
        "refreshToken",
      );
    });

    it("should return an error if the email does not exist", async () => {
      const email = "test@example.com";
      const password = "password123";

      executeQuery.mockResolvedValue([]); // Mock that the email does not exist

      const result = await authService.login(email, password);

      expect(result).toEqual({ error: "No such email exists", path: "email" });
      expect(executeQuery).toHaveBeenCalledWith(queries.getStudentByEmail, [
        email,
      ]);
    });

    it("should return an error if the password is incorrect", async () => {
      const email = "test@example.com";
      const password = "wrongPassword";
      const hashedPassword = "hashedPassword";

      // Mock database query and bcrypt password comparison failure
      executeQuery.mockResolvedValue([{ id: 1, password: hashedPassword }]);
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.login(email, password);

      expect(result).toEqual({
        error: "Password is incorrect",
        path: "password",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe("logout", () => {
    it("should return true if the refresh token was deleted successfully", async () => {
      const refreshToken = "someRefreshToken";

      executeQuery.mockResolvedValue({ affectedRows: 1 }); // Mock successful deletion

      const result = await authService.logout(refreshToken);

      expect(result).toBe(true);
      expect(executeQuery).toHaveBeenCalledWith(queries.deleteToken, [
        refreshToken,
      ]);
    });

    it("should return false if the refresh token was not deleted", async () => {
      const refreshToken = "someRefreshToken";

      executeQuery.mockResolvedValue({ affectedRows: 0 }); // Mock failed deletion

      const result = await authService.logout(refreshToken);

      expect(result).toBe(false);
      expect(executeQuery).toHaveBeenCalledWith(queries.deleteToken, [
        refreshToken,
      ]);
    });
  });

  // Tests for email validation logic
  describe("Email Validation", () => {
    it("should return an error if email is not provided", () => {
      const result = validateEmail("");
      expect(result).toBe("Email is required"); // Validate the error for missing email
    });

    it("should return an error if email format is invalid", () => {
      const result = validateEmail("invalid-email");
      expect(result).toBe("Email format is invalid"); // Validate the error for invalid format
    });

    it("should return an error if email is too long", () => {
      const longEmail = "a".repeat(51) + "@example.com";
      const result = validateEmail(longEmail);
      expect(result).toBe("Email must be no more than 50 characters long"); // Validate the error for length
    });

    it("should return null if email is valid", () => {
      const result = validateEmail("test@example.com");
      expect(result).toBeNull(); // Validate that a valid email returns null
    });
  });

  // Tests for password validation logic
  describe("Password Validation", () => {
    it("should return an error if password is too short", () => {
      const result = validatePassword("aB1");
      expect(result).toBe("Password must be at least 6 characters long"); // Validate the error for short password
    });

    it("should return an error if password does not contain a digit", () => {
      const result = validatePassword("Password");
      expect(result).toBe("Password must contain at least one digit"); // Validate the error for missing digit
    });

    it("should return an error if password does not contain an uppercase letter", () => {
      const result = validatePassword("password1");
      expect(result).toBe(
        "Password must contain at least one uppercase letter",
      ); // Validate the error for missing uppercase letter
    });

    it("should return an error if password does not contain a lowercase letter", () => {
      const result = validatePassword("PASSWORD1");
      expect(result).toBe(
        "Password must contain at least one lowercase letter",
      ); // Validate the error for missing lowercase letter
    });

    it("should return null if password is valid", () => {
      const result = validatePassword("Password1");
      expect(result).toBeNull(); // Validate that a valid password returns null
    });
  });
});
