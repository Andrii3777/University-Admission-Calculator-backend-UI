const tokenService = require("../../services/tokenService");
const jwt = require("../../jwt/jwt");
const { executeQuery } = require("../../sql/executeQuery");
const env = require("../../config");
const queries = require("../../sql/sqlQueries");

jest.mock("../../jwt/jwt");
jest.mock("../../sql/executeQuery");

describe("TokenService", () => {
  const studentId = 1;
  const email = "test@example.com";
  const payload = { id: studentId, email };
  const refreshToken = "mockRefreshToken";
  const accessToken = "mockAccessToken";

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      // Mock JWT sign to return predefined tokens
      jwt.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const tokens = tokenService.generateTokens(payload);

      // Validate that JWT sign was called with correct parameters for both tokens
      expect(jwt.sign).toHaveBeenCalledWith(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: `${env.ACCESS_TOKEN_AGE_SECONDS}s`,
      });
      expect(jwt.sign).toHaveBeenCalledWith(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: `${env.REFRESH_TOKEN_AGE_SECONDS}s`,
      });
      // Check that the generated tokens match the expected result
      expect(tokens).toEqual({ accessToken, refreshToken });
    });
  });

  describe("validateAccessToken", () => {
    it("should return decoded payload if the access token is valid", () => {
      // Mock JWT verify to return the payload
      jwt.verify.mockReturnValue(payload);

      const result = tokenService.validateAccessToken(accessToken);

      // Validate that JWT verify was called with the correct access token and secret
      expect(jwt.verify).toHaveBeenCalledWith(
        accessToken,
        env.JWT_ACCESS_SECRET,
      );
      // Check that the result matches the expected payload
      expect(result).toEqual(payload);
    });

    it("should return null if the access token is invalid", () => {
      // Mock JWT verify to throw an error for an invalid token
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = tokenService.validateAccessToken("invalidToken");

      // Check that the result is null when the token is invalid
      expect(result).toBeNull();
    });
  });

  describe("validateRefreshToken", () => {
    it("should return decoded payload if the refresh token is valid", () => {
      jwt.verify.mockReturnValue(payload);

      const result = tokenService.validateRefreshToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        env.JWT_REFRESH_SECRET,
      );
      expect(result).toEqual(payload);
    });

    it("should return null if the refresh token is invalid", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = tokenService.validateRefreshToken("invalidToken");

      expect(result).toBeNull();
    });
  });

  describe("saveToken", () => {
    it("should update the refresh token if it already exists for the student", async () => {
      // Mock executeQuery to simulate finding the token in the database
      executeQuery.mockResolvedValueOnce([{}]);

      await tokenService.saveToken(studentId, refreshToken);

      // Validate that executeQuery was called with the update query and correct parameters
      expect(executeQuery).toHaveBeenCalledWith(
        queries.updateTokenByStudentId,
        [refreshToken, studentId],
      );
    });

    it("should insert a new refresh token if it does not exist for the student", async () => {
      // Mock executeQuery to simulate not finding the token in the database
      executeQuery.mockResolvedValueOnce([]);

      await tokenService.saveToken(studentId, refreshToken);

      // Validate that executeQuery was called with the insert query and correct parameters
      expect(executeQuery).toHaveBeenCalledWith(queries.insertToken, [
        refreshToken,
        studentId,
      ]);
    });
  });

  describe("refresh", () => {
    it("should return new tokens if refresh token is valid and student exists", async () => {
      jwt.verify.mockReturnValue(payload);
      executeQuery
        .mockResolvedValueOnce([refreshToken]) // Token found in DB
        .mockResolvedValueOnce([{ id: studentId, email }]); // Student found in DB
      // Mock generateTokens to return predefined tokens
      tokenService.generateTokens = jest
        .fn()
        .mockReturnValue({ accessToken, refreshToken });

      const result = await tokenService.refresh(refreshToken);

      expect(executeQuery).toHaveBeenCalledWith(queries.getToken, [
        refreshToken,
      ]);
      expect(executeQuery).toHaveBeenCalledWith(queries.getStudentById, [
        studentId,
      ]);
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        id: studentId,
        email,
      });
      expect(result).toEqual({
        tokens: { accessToken, refreshToken },
        studentId,
      });
    });

    it("should return an error if the refresh token is invalid", async () => {
      // Mock JWT verify to return null for an invalid token
      jwt.verify.mockReturnValue(null);
      // Mock executeQuery to simulate not finding the token in the database
      executeQuery.mockResolvedValueOnce([]);

      const result = await tokenService.refresh("invalidToken");

      expect(result).toEqual({ error: "Refresh token is not valid" });
    });

    it("should return an error if the student does not exist", async () => {
      jwt.verify.mockReturnValue(payload);
      executeQuery
        .mockResolvedValueOnce([refreshToken]) // Token found in DB
        .mockResolvedValueOnce([]); // Student not found

      const result = await tokenService.refresh(refreshToken);

      // Check that the result contains an error message for student not found
      expect(result).toEqual({ error: "Student not found" });
    });
  });
});
