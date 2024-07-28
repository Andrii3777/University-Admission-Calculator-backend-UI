const queries = {
    getEmail: 'SELECT email FROM student WHERE email = ?',
    getStudentByEmail: 'SELECT * FROM student WHERE email = ?',
    getStudentById: 'SELECT * FROM student WHERE id = ?',
    getExams: 'SELECT id, name FROM exam',
    getTokenByStudentId: 'SELECT * FROM refreshToken WHERE studentId = ?',
    updateTokenByStudentId: 'UPDATE refreshToken SET token = ? WHERE studentId = ?',
    insertToken: 'INSERT INTO refreshToken (token, studentId) VALUES (?, ?)',
    deleteToken: 'DELETE FROM refreshToken WHERE token = ?',
    getToken: 'SELECT * FROM refreshToken WHERE token = ?',
    insertStudent: 'INSERT INTO student (email, password) VALUES (?, ?)',
    getStudentScores: `
        SELECT exam.name AS examName, studentExam.score
        FROM studentExam
        JOIN exam ON studentExam.examId = exam.id
        WHERE studentExam.studentId = ?
    `,
    insertOrUpdateStudentExamScores: `
        INSERT INTO studentExam (studentId, examId, score)
        VALUES ?
        ON DUPLICATE KEY UPDATE score = VALUES(score)
    `,
    getSpecsAndCoefs: `
        SELECT s.id, s.name, s.tuitionCost, s.passingScoreForFree, s.passingScoreForPaid, se.examId, se.coefficient
        FROM specialty s
        JOIN specialtyExamCoefficient se ON s.id = se.specialtyId
    `,
    checkIfEmtySpecialityTable: 'SELECT COUNT(*) AS count FROM specialty',
    checkIfEmtySpecialtyExamCoefficientTable: 'SELECT COUNT(*) AS count FROM specialtyExamCoefficient',
}

module.exports = queries;
