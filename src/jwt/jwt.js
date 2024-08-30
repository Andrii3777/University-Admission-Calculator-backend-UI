const crypto = require("crypto");

class JWT {
  /**
   * Encodes a buffer to Base64 URL format.
   * @param {Buffer} source - The buffer to encode.
   * @returns {string} - The Base64 URL encoded string.
   */
  #base64url(source) {
    return source
      .toString("base64") // Convert buffer to base64 string.
      .replace(/=/g, "") // Remove padding '=' characters.
      .replace(/\+/g, "-") // Replace '+' with '-' for URL-safe encoding.
      .replace(/\//g, "_"); // Replace '/' with '_' for URL-safe encoding.
  }

  /**
   * Creates a signature for the JWT using HMAC SHA256 algorithm.
   * @param {string} header - The encoded JWT header.
   * @param {string} payload - The encoded JWT payload.
   * @param {string} secret - The secret key used for signing.
   * @returns {string} - The Base64 URL encoded signature.
   */
  #createSignature(header, payload, secret) {
    const data = `${header}.${payload}`; // Concatenate header and payload.
    return this.#base64url(
      crypto
        .createHmac("sha256", secret) // Create HMAC SHA256 signature.
        .update(data) // Update HMAC with the data.
        .digest(),
    ); // Finalize and get the digest.
  }

  /**
   * Converts a time string (with unit) to seconds.
   * @param {string} time - The time string with unit (e.g., '1h', '30m').
   * @returns {number} - The time converted to seconds.
   * @throws {Error} - If the time format is invalid.
   */
  #convertToSeconds(time) {
    const unit = time.slice(-1); // Get the unit (e.g., 's', 'm', 'h').
    const value = parseInt(time.slice(0, -1), 10); // Get the numeric value.

    // Convert the time to seconds based on the unit.
    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      case "w":
        return value * 60 * 60 * 24 * 7;
      case "y":
        return value * 60 * 60 * 24 * 365;
      default:
        throw new Error("Invalid expiresIn format");
    }
  }

  /**
   * Signs the payload and creates a JWT.
   * @param {Object} payload - The payload to include in the token.
   * @param {string} secret - The secret key used for signing.
   * @param {Object} [options] - Optional settings for the token (e.g., expiration).
   * @returns {string} - The generated JWT.
   */
  sign(payload, secret, options = {}) {
    const header = {
      alg: "HS256", // Algorithm used for signing.
      typ: "JWT", // Type of token.
    };
    const now = Math.floor(Date.now() / 1000); // Current time in seconds.

    // Set expiration if provided.
    if (options.expiresIn) {
      const expiresInSeconds = this.#convertToSeconds(options.expiresIn);
      payload.exp = now + expiresInSeconds;
    }
    payload.iat = now;

    const encodedHeader = this.#base64url(Buffer.from(JSON.stringify(header)));
    const encodedPayload = this.#base64url(
      Buffer.from(JSON.stringify(payload)),
    );
    // Create the signature.
    const signature = this.#createSignature(
      encodedHeader,
      encodedPayload,
      secret,
    );

    // Return the JWT in the format: header.payload.signature.
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies the authenticity and validity of a JWT.
   * @param {string} token - The JWT to verify.
   * @param {string} secret - The secret key used for verifying.
   * @returns {Object} - The decoded payload if the token is valid.
   * @throws {Error} - If the token is invalid or expired.
   */
  verify(token, secret) {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    const [encodedHeader, encodedPayload, signature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error("Invalid token structure");
    }

    // Create expected signature and compare with provided signature.
    const expectedSignature = this.#createSignature(
      encodedHeader,
      encodedPayload,
      secret,
    );
    if (expectedSignature !== signature) {
      throw new Error("Invalid signature");
    }

    // Decode payload and check expiration.
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64").toString("utf8"),
    );
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      throw new Error("Token expired");
    }

    return payload;
  }
}

module.exports = new JWT();
