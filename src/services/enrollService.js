const { executeQuery } = require('../sql/executeQuery');
const queries = require('../sql/sqlQueries');
const validateScores = require('../validations/scoreValidation');

/**
 * EnrollService handles student enrollment operations, including score validation,
 * saving scores, and determining eligible specialties.
 */
class EnrollService {
    /**
     * Enrolls a student by validating their scores and determining eligible specialties.
     * @param {number} studentId - The ID of the student.
     * @param {Object} scores - The scores of the student in different exams.
     * @returns {Promise<Object>} An object containing either an error message or the eligible specialties.
     */
    async enroll(studentId, scores) {
        // Validate scores
        const scoresValidation = validateScores(scores);
        if (scoresValidation) {
            return { error: scoresValidation };
        }

        // Save student scores
        await this._saveStudentScores(studentId, scores);

        // Get appropriate specialties based on scores
        const specialties = await this._getAppropriateSpecialties(scores);

        return { specialties };
    }

    /**
     * Retrieves a student's scores from the database.
     * @param {number} studentId - The ID of the student.
     * @returns {Promise<Object>} An object where keys are exam names and values are scores.
     */
    async getStudentScores(studentId) {
        const rows = await executeQuery(queries.getStudentScores, [studentId]);
        const scores = {};

        rows.forEach(row => {
            scores[row.examName] = row.score;
        });

        return scores;
    }

    /**
     * Saves the student's scores in the database.
     * @param {number} studentId - The ID of the student.
     * @param {Object} scores - The scores of the student.
     * @private
     */
    async _saveStudentScores(studentId, scores) {
        const examsRows = await executeQuery(queries.getExams);
        const examsMap = new Map(examsRows.map(exam => [exam.name, exam.id]));

        const values = [];
        for (const [examName, score] of Object.entries(scores)) {
            if (examsMap.has(examName)) {
                const examId = examsMap.get(examName);
                values.push([studentId, examId, score]);
            }
        }

        if (values.length > 0) {
            await executeQuery(queries.insertOrUpdateStudentExamScores, [values]);
        }
    }

    /**
     * Determines the appropriate specialties for a student based on their scores.
     * @param {Object} scores - The scores of the student.
     * @returns {Promise<Object>} An object with arrays for free and paid specialties.
     * @private
     */
    async _getAppropriateSpecialties(scores) {
        const specialties = { free: [], paid: [] };

        const specialtiesRows = await executeQuery(queries.getSpecsAndCoefs);
        const specialtiesMap = this._buildSpecialtiesMap(specialtiesRows);

        const examsRows = await executeQuery(queries.getExams);
        const examsMap = new Map(examsRows.map(exam => [exam.name, exam.id]));

        this._classifySpecialties(scores, specialtiesMap, examsMap, specialties);
        this._sortSpecialties(specialties);

        return specialties;
    }

    /**
     * Builds a map of specialties with their respective coefficients.
     * @param {Array} rows - Array of specialty rows from the database.
     * @returns {Map} A map of specialties with their coefficients.
     * @private
     */
    _buildSpecialtiesMap(rows) {
        const specialtiesMap = new Map();

        rows.forEach(row => {
            if (!specialtiesMap.has(row.id)) {
                specialtiesMap.set(row.id, {
                    id: row.id,
                    name: row.name,
                    tuitionCost: row.tuitionCost,
                    passingScoreForFree: row.passingScoreForFree,
                    passingScoreForPaid: row.passingScoreForPaid,
                    coefficients: {}
                });
            }

            const specialty = specialtiesMap.get(row.id);
            specialty.coefficients[row.examId] = row.coefficient;
        });

        return specialtiesMap;
    }

    /**
     * Classifies specialties as free or paid based on user scores and thresholds.
     * @param {Object} scores - The student's exam scores.
     * @param {Map} specialtiesMap - Map of specialties with their coefficients.
     * @param {Map} examsMap - Map of exams with their IDs.
     * @param {Object} specialties - Object to hold classified specialties.
     * @private
     */
    _classifySpecialties(scores, specialtiesMap, examsMap, specialties) {
        specialtiesMap.forEach(specialty => {
            let totalScore = 0;
            let calculationDetails = '';

            for (const [examName, score] of Object.entries(scores)) {
                if (examsMap.has(examName)) {
                    const examId = examsMap.get(examName);
                    const coefficient = specialty.coefficients[examId];
                    totalScore += Number(score) * coefficient;
                    calculationDetails += `${Number(score)} * ${coefficient} + `;
                }
            }

            calculationDetails = calculationDetails.slice(0, -3);
            totalScore = totalScore.toFixed(1);

            if (totalScore >= specialty.passingScoreForFree) {
                specialties.free.push({
                    ...specialty,
                    totalScore,
                    calculationDetails,
                    requiredScore: specialty.passingScoreForFree
                });
            } else if (totalScore >= specialty.passingScoreForPaid) {
                specialties.paid.push({
                    ...specialty,
                    totalScore,
                    calculationDetails,
                    requiredScore: specialty.passingScoreForPaid
                });
            }
        });
    }

    /**
     * Sorts specialties in the given object.
     * Free specialties are sorted by descending required score.
     * Paid specialties are sorted by ascending tuition cost.
     * @param {Object} specialties - Object containing arrays for free and paid specialties.
     * @private
     */
    _sortSpecialties(specialties) {
        specialties.free.sort((a, b) => b.requiredScore - a.requiredScore);
        specialties.paid.sort((a, b) => a.tuitionCost - b.tuitionCost);
    }
}

module.exports = new EnrollService();