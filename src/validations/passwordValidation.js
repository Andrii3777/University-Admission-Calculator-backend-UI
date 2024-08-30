/**
 * Validates the password against specified requirements.
 *
 * @param {string} password - The password to be validated.
 * @returns {(string|null)} A string containing a validation error message or null if the password is valid.
 */
function validatePassword(password) {
  const minLength = 6;

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  // Regular expression to check for at least one digit
  const hasDigit = /\d/;
  if (!hasDigit.test(password)) {
    return "Password must contain at least one digit";
  }

  // Regular expression to check for at least one uppercase letter
  const hasUppercase = /[A-Z]/;
  if (!hasUppercase.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  // Regular expression to check for at least one lowercase letter
  const hasLowercase = /[a-z]/;
  if (!hasLowercase.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  // If all checks pass, return null indicating the password is valid
  return null;
}

module.exports = validatePassword;
