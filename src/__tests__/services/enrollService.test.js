const enrollService = require("../../services/enrollService");
const validateScores = require("../../validations/scoreValidation");
const { executeQuery } = require("../../sql/executeQuery");
const queries = require("../../sql/sqlQueries");

jest.mock("../../sql/executeQuery");
jest.mock("../../validations/scoreValidation");

describe("enrollService", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test to prevent interference
  });

  describe("enroll", () => {
    test("should return error if scores validation fails", async () => {
      const studentId = 1;
      const scores = { Mathematics: 101, Physics: -1 }; // Example of invalid scores
      const validationError = "Invalid score for Mathematics.";

      // Mock validation function to return an error
      validateScores.mockReturnValue(validationError);

      const result = await enrollService.enroll(studentId, scores);

      // Validate the result and that the validation function was called
      expect(validateScores).toHaveBeenCalledWith(scores);
      expect(result).toEqual({ error: validationError });
    });

    test("should save scores and return eligible specialties", async () => {
      const studentId = 1;
      const scores = { Mathematics: 90, Physics: 85 };
      const mockSpecialties = {
        free: [
          {
            id: 1,
            name: "Computer Science",
            totalScore: "279.5",
            calculationDetails: "90 * 1.5 + 85 * 1.3",
            requiredScore: 280.0,
          },
        ],
        paid: [
          {
            id: 2,
            name: "Mechanical Engineering",
            totalScore: "258.5",
            calculationDetails: "90 * 1.4 + 85 * 1.5",
            requiredScore: 170.0,
            tuitionCost: 3200.0,
          },
        ],
      };

      // Mock validation to be successful
      validateScores.mockReturnValue(null);

      // Mock internal methods to avoid actual database operations
      jest.spyOn(enrollService, "_saveStudentScores").mockResolvedValue();
      jest
        .spyOn(enrollService, "_getAppropriateSpecialties")
        .mockResolvedValue(mockSpecialties);

      const result = await enrollService.enroll(studentId, scores);

      expect(validateScores).toHaveBeenCalledWith(scores);
      expect(enrollService._saveStudentScores).toHaveBeenCalledWith(
        studentId,
        scores,
      );
      expect(enrollService._getAppropriateSpecialties).toHaveBeenCalledWith(
        scores,
      );
      expect(result).toEqual({ specialties: mockSpecialties });
    });
  });

  describe("getStudentScores", () => {
    test("should retrieve and return student scores in the correct format", async () => {
      const studentId = 1;
      const mockRows = [
        { examName: "Mathematics", score: 90 },
        { examName: "Physics", score: 85 },
        { examName: "Chemistry", score: 88 },
      ];

      const expectedScores = {
        Mathematics: 90,
        Physics: 85,
        Chemistry: 88,
      };

      executeQuery.mockResolvedValue(mockRows);

      const result = await enrollService.getStudentScores(studentId);

      expect(executeQuery).toHaveBeenCalledWith(queries.getStudentScores, [
        studentId,
      ]);
      expect(result).toEqual(expectedScores);
    });

    test("should return an empty object if no scores are found", async () => {
      const studentId = 2;
      const mockRows = []; // Simulate no scores found

      executeQuery.mockResolvedValue(mockRows);

      const result = await enrollService.getStudentScores(studentId);

      // Validate that the query was executed and that the result is an empty object
      expect(executeQuery).toHaveBeenCalledWith(queries.getStudentScores, [
        studentId,
      ]);
      expect(result).toEqual({});
    });
  });
});
