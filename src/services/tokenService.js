const env = require("../config");
const jwt = require("../jwt/jwt");
const { executeQuery } = require("../sql/executeQuery");
const queries = require("../sql/sqlQueries");

/**
 * TokenService handles operations related to JWT token generation, validation, and management.
 */
class TokenService {
  /**
   * Generates access and refresh tokens.
   * @param {Object} payload - The payload to include in the tokens.
   * @returns {Object} - The generated access and refresh tokens.
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: `${env.ACCESS_TOKEN_AGE_SECONDS}s`,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: `${env.REFRESH_TOKEN_AGE_SECONDS}s`,
    });
    return { accessToken, refreshToken };
  }

  /**
   * Validates an access token.
   * @param {string} token - The access token to validate.
   * @returns {Object|null} - The decoded token payload if valid, otherwise null.
   */
  validateAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * Validates a refresh token.
   * @param {string} token - The refresh token to validate.
   * @returns {Object|null} - The decoded token payload if valid, otherwise null.
   */
  validateRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * Saves a refresh token in the database. Updates if already exists.
   * @param {number} studentId - The ID of the student.
   * @param {string} refreshToken - The refresh token to save.
   * @returns {Promise<void>}
   */
  async saveToken(studentId, refreshToken) {
    const existingToken = await executeQuery(queries.getTokenByStudentId, [
      studentId,
    ]);

    if (existingToken?.length > 0) {
      await executeQuery(queries.updateTokenByStudentId, [
        refreshToken,
        studentId,
      ]);
    } else {
      await executeQuery(queries.insertToken, [refreshToken, studentId]);
    }
  }

  /**
   * Refreshes tokens using a refresh token.
   * @param {string} refreshToken - The refresh token to use for refreshing tokens.
   * @returns {Promise<Object>} - The new tokens and student ID if valid, otherwise an error message.
   */
  async refresh(refreshToken) {
    const studentData = this.validateRefreshToken(refreshToken);
    const tokenFromDb = await executeQuery(queries.getToken, [refreshToken]);

    if (!studentData || tokenFromDb.length === 0) {
      return { error: "Refresh token is not valid" };
    }

    const student = await executeQuery(queries.getStudentById, [
      studentData.id,
    ]);
    if (student.length === 0) {
      return { error: "Student not found" };
    }

    const { id, email } = student[0];
    const tokens = this.generateTokens({ id, email });

    await this.saveToken(id, tokens.refreshToken);
    return { tokens, studentId: id };
  }
}

module.exports = new TokenService();
