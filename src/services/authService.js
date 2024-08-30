const bcrypt = require("bcrypt");
const { executeQuery } = require("../sql/executeQuery");
const validatePassword = require("../validations/passwordValidation");
const validateEmail = require("../validations/emailValidation");
const tokenService = require("./tokenService");
const queries = require("../sql/sqlQueries");

/**
 * AuthService handles authentication related operations such as signup, login, and logout.
 */
class AuthService {
  /**
   * Registers a new student by hashing their password and generating JWT tokens.
   * @param {string} email - The email of the student.
   * @param {string} password - The password of the student.
   * @returns {Promise<object>} An object containing either error messages or the student's ID and tokens.
   */
  async signup(email, password) {
    try {
      // Check if the email is already in use
      const existingEmails = await executeQuery(queries.getEmail, [email]);
      if (existingEmails.length > 0) {
        return { error: "That email is already in use", path: "email" };
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        return { error: emailValidation, path: "email" };
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        return { error: passwordValidation, path: "password" };
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      // Insert new student into the database
      const newStudent = await executeQuery(queries.insertStudent, [
        email,
        hashedPassword,
      ]);

      // Generate JWT tokens
      const { accessToken, refreshToken } = tokenService.generateTokens({
        id: newStudent.insertId,
        email,
      });
      await tokenService.saveToken(newStudent.insertId, refreshToken);

      return { studentId: newStudent.insertId, accessToken, refreshToken };
    } catch (error) {
      console.error("Error during signup:", error);
      throw new Error("Signup failed");
    }
  }

  /**
   * Logs in a student by verifying their credentials and generating JWT tokens.
   * @param {string} email - The email of the student.
   * @param {string} password - The password of the student.
   * @returns {Promise<object>} An object containing either error messages or the student's ID and tokens.
   */
  async login(email, password) {
    try {
      const results = await executeQuery(queries.getStudentByEmail, [email]);
      if (results.length === 0) {
        return { error: "No such email exists", path: "email" };
      }

      const student = results[0];

      // Compare the provided password with the hashed password in the database
      const isPasswordMatch = await bcrypt.compare(password, student.password);
      if (!isPasswordMatch) {
        return { error: "Password is incorrect", path: "password" };
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = tokenService.generateTokens({
        id: student.id,
        email,
      });
      await tokenService.saveToken(student.id, refreshToken);

      return { studentId: student.id, accessToken, refreshToken };
    } catch (error) {
      console.error("Error during login:", error);
      throw new Error("Login failed");
    }
  }

  /**
   * Logs out a student by deleting their refresh token from the database.
   * @param {string} refreshToken - The refresh token to be deleted.
   * @returns {Promise<boolean>} True if the token was successfully deleted, false otherwise.
   */
  async logout(refreshToken) {
    try {
      const result = await executeQuery(queries.deleteToken, [refreshToken]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error during logout:", error);
      throw new Error("Logout failed");
    }
  }
}

module.exports = new AuthService();
