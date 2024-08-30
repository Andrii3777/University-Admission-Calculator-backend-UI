const tokenService = require("../services/tokenService.js");
const enrollService = require("../services/enrollService");

class EnrollController {
  /**
   * Handles the enrollment request by saving student scores and retrieving eligible specialties.
   */
  async enroll(req, res) {
    try {
      const { scores } = req.body;
      const studentId = defineCurStudentId(req);

      if (!studentId) {
        return res.status(401).json("Invalid Access Token");
      }

      const result = await enrollService.enroll(studentId, scores);

      if (result.error) {
        return res.status(400).json(result);
      }

      const specialties = result.specialties;

      // Send the response based on the types of specialties available.
      if (specialties.free.length > 0) {
        res.status(200).json({
          message: "List of specialties defined successfully",
          type: "free",
          specialties: specialties.free,
        });
      } else if (specialties.paid.length > 0) {
        res.status(200).json({
          message: "List of specialties defined successfully",
          type: "paid",
          specialties: specialties.paid,
        });
      } else {
        res.status(200).json({
          message: "List of specialties defined successfully",
          type: "none",
          specialties: "No specialties available for the provided scores.",
        });
      }
    } catch (error) {
      res.status(error?.status || 500).send({ error: error?.message || error });
    }
  }

  /**
   * Handles the request to get the scores of a student.
   */
  async getStudentScores(req, res) {
    try {
      const studentId = defineCurStudentId(req);

      if (!studentId) {
        return res.status(401).json("Invalid Access Token");
      }

      const scores = await enrollService.getStudentScores(studentId);

      res.json({ scores });
    } catch (error) {
      res.status(error?.status || 500).send({ error: error?.message || error });
    }
  }
}

/**
 * Retrieves the studentId from the tokens stored in cookies.
 * @param {object} req - The HTTP request object.
 * @returns {number|null} - The studentId extracted from the tokens, or null if invalid.
 */
function defineCurStudentId(req) {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return null;
  }

  const payloadAccess = tokenService.validateAccessToken(accessToken);
  const payloadRefresh = tokenService.validateRefreshToken(refreshToken);

  return payloadAccess?.id || payloadRefresh?.id || null;
}

module.exports = new EnrollController();
