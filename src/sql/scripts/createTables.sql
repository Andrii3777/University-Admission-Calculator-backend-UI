CREATE TABLE IF NOT EXISTS student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS refreshToken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    studentId INT,
    FOREIGN KEY (studentId) REFERENCES student(id)
);

CREATE TABLE IF NOT EXISTS exam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS studentExam (
    studentId INT,
    examId INT,
    score INT,
    PRIMARY KEY (studentId, examId),
    FOREIGN KEY (studentId) REFERENCES student(id),
    FOREIGN KEY (examId) REFERENCES exam(id)
);

CREATE TABLE IF NOT EXISTS specialty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tuitionCost DECIMAL(10, 2) NOT NULL,
    passingScoreForFree DECIMAL(5, 2) NOT NULL,
    passingScoreForPaid DECIMAL(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS specialtyExamCoefficient (
    specialtyId INT,
    examId INT,
    coefficient DECIMAL(5, 2),
    PRIMARY KEY (specialtyId, examId),
    FOREIGN KEY (specialtyId) REFERENCES specialty(id),
    FOREIGN KEY (examId) REFERENCES exam(id)
);