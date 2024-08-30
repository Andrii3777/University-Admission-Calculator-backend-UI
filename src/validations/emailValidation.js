/**
 * Validates the email against specified requirements.
 *
 * @param {string} email - The email to be validated.
 * @returns {(string|null)} A string containing a validation error message or null if the email is valid.
 */
function validateEmail(email) {
  if (!email) {
    return "Email is required";
  }

  // eslint-disable-next-line no-useless-escape
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!emailRegex.test(email)) {
    return "Email format is invalid";
  }

  const maxLength = 50;

  if (email.length > maxLength) {
    return `Email must be no more than ${maxLength} characters long`;
  }

  // If all checks pass, return null indicating the email is valid
  return null;
}

module.exports = validateEmail;
