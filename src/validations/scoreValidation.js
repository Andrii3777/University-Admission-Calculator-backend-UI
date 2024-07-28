/**
 * Validates the exam scores against specified requirements.
 *
 * @param {object} scores - An object containing exam names as keys and scores as values.
 * @param {number} scores[examName] - The score for each exam, which must be an integer between 0 and 100.
 * @returns {(string|null)} A validation error message if any score is invalid, or null if all scores are valid.
 */
function validateScores(scores) {
    // Regular expression to check if the score is an integer between 0 and 100
    const numberRegex = /^(100|[1-9]?[0-9])$/;

    for (const examName in scores) {
        const score = scores[examName];

        // Check if the score matches the valid integer range pattern
        if (!numberRegex.test(score)) {
            return `Score for "${examName}" must be an integer number between 0 and 100`;
        }
    }

    // Return null if all scores are valid
    return null;
}

module.exports = validateScores;