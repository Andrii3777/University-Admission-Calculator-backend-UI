const authController = require("../../controllers/authController.js");
const authService = require("../../services/authService.js");
const tokenService = require("../../services/tokenService.js");
const env = require("../../config.js");

// Mock dependencies to isolate controller behavior
jest.mock("../../services/authService.js");
jest.mock("../../services/tokenService.js");

describe("authController", () => {
  let req, res;

  // Setting up mock request and response objects before each test
  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe("signup", () => {
    // Test case for successful signup
    it("should sign up a student and return 201 status", async () => {
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      authService.signup.mockResolvedValue(mockTokens);

      req.body = { email: "test@example.com", password: "password123" }; // Mock request data

      await authController.signup(req, res);

      expect(authService.signup).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      // Assert that cookies were set with the correct values and options
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Student signed up successfully",
        accessToken: "access-token",
      });
    });

    // Test case for signup failure with a 400 status
    it("should return 400 status if signup fails", async () => {
      authService.signup.mockResolvedValue({ error: "Signup failed" }); // Mocking signup failure

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Signup failed" });
    });

    // Test case for handling errors in the signup method
    it("should handle errors and return 500 status", async () => {
      const error = new Error("Signup error");
      authService.signup.mockRejectedValue(error); // Mocking an error during signup

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Signup error" });
    });
  });

  describe("login", () => {
    // Test case for successful login
    it("should log in a student and return 200 status", async () => {
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      authService.login.mockResolvedValue(mockTokens);

      req.body = { email: "test@example.com", password: "password123" }; // Mock request data

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token",
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Student logged in successfully",
        accessToken: "access-token",
      });
    });

    // Test case for login failure with a 401 status
    it("should return 401 status if login fails", async () => {
      authService.login.mockResolvedValue({ error: "Login failed" }); // Mocking login failure

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Login failed" });
    });

    // Test case for handling errors in the login method
    it("should handle errors and return 500 status", async () => {
      const error = new Error("Login error");
      authService.login.mockRejectedValue(error); // Mocking an error during login

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Login error" });
    });
  });

  describe("logout", () => {
    // Test case for successful logout
    it("should log out a student and redirect to the base path", async () => {
      req.cookies.refreshToken = "refresh-token"; // Mock refresh token in cookies
      authService.logout.mockResolvedValue(); // Mocking successful logout

      await authController.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith("refresh-token");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.redirect).toHaveBeenCalledWith(env.API_BASE_PATH);
    });

    // Test case for handling errors in the logout method
    it("should handle errors and return 500 status", async () => {
      const error = new Error("Logout error");
      authService.logout.mockRejectedValue(error); // Mocking an error during logout

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Logout error" });
    });
  });

  describe("refresh", () => {
    // Test case for refreshing tokens successfully
    it("should refresh tokens and call next()", async () => {
      req.cookies.refreshToken = "refresh-token"; // Mock refresh token in cookies
      const mockTokens = {
        tokens: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };
      tokenService.refresh.mockResolvedValue(mockTokens); // Mocking successful token refresh

      const next = jest.fn(); // Mock next function

      await authController.refresh(req, res, next);

      expect(tokenService.refresh).toHaveBeenCalledWith("refresh-token");
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.any(Object),
      );
      expect(next).toHaveBeenCalled();
    });

    // Test case for redirecting to login if refresh token is missing
    it("should redirect to login if refresh token is missing", async () => {
      await authController.refresh(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`${env.API_BASE_PATH}/login/`);
    });

    // Test case for redirecting to login if refresh token is invalid
    it("should redirect to login if refresh token is invalid", async () => {
      req.cookies.refreshToken = "invalid-refresh-token"; // Mock invalid refresh token
      tokenService.refresh.mockResolvedValue({ error: "Invalid token" }); // Mocking failed token refresh

      await authController.refresh(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`${env.API_BASE_PATH}/login/`);
    });

    // Test case for handling errors in the refresh method
    it("should handle errors and return 500 status", async () => {
      const error = new Error("Refresh error");
      req.cookies.refreshToken = "refresh-token"; // Mock refresh token in cookies
      tokenService.refresh.mockRejectedValue(error); // Mocking an error during token refresh

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Refresh error" });
    });
  });
});
