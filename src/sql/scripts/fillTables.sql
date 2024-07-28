-- Insert data into the 'exam' table
INSERT INTO exam (name) VALUES
    ('Mathematics'),
    ('Physics'),
    ('Chemistry'),
    ('Biology');

-- Insert data into the 'specialty' table
INSERT INTO specialty (name, tuitionCost, passingScoreForFree, passingScoreForPaid) VALUES
    ('Computer Science', 3000.00, 280.00, 180.00),
    ('Mechanical Engineering', 3200.00, 270.00, 170.00),
    ('Electrical Engineering', 3100.00, 275.00, 175.00),
    ('Civil Engineering', 2900.00, 265.00, 165.00),
    ('Biotechnology', 3300.00, 285.00, 185.00),
    ('Software Engineering', 3400.00, 290.00, 200.00),
    ('Aerospace Engineering', 3500.00, 295.00, 205.00),
    ('Environmental Engineering', 3100.00, 275.00, 185.00),
    ('Biomedical Engineering', 3200.00, 280.00, 190.00),
    ('Industrial Engineering', 3300.00, 285.00, 195.00);

-- Insert data into the 'specialtyExamCoefficient' table
INSERT INTO specialtyExamCoefficient (specialtyId, examId, coefficient) VALUES
    (1, 1, 1.5), -- Computer Science
    (1, 2, 1.3),
    (1, 3, 1.2),
    (1, 4, 1.1),
    (2, 1, 1.4), -- Mechanical Engineering
    (2, 2, 1.5),
    (2, 3, 1.1),
    (2, 4, 1.0),
    (3, 1, 1.3), -- Electrical Engineering
    (3, 2, 1.4),
    (3, 3, 1.2),
    (3, 4, 1.1),
    (4, 1, 1.2), -- Civil Engineering
    (4, 2, 1.3),
    (4, 3, 1.5),
    (4, 4, 1.0),
    (5, 1, 1.5), -- Biotechnology
    (5, 2, 1.4),
    (5, 3, 1.3),
    (5, 4, 1.2),
    (6, 1, 1.6), -- Software Engineering
    (6, 2, 1.4),
    (6, 3, 1.3),
    (6, 4, 1.2),
    (7, 1, 1.5), -- Aerospace Engineering
    (7, 2, 1.5),
    (7, 3, 1.4),
    (7, 4, 1.3),
    (8, 1, 1.4), -- Environmental Engineering
    (8, 2, 1.6),
    (8, 3, 1.3),
    (8, 4, 1.2),
    (9, 1, 1.5), -- Biomedical Engineering
    (9, 2, 1.4),
    (9, 3, 1.4),
    (9, 4, 1.3),
    (10, 1, 1.6), -- Industrial Engineering
    (10, 2, 1.5),
    (10, 3, 1.4),
    (10, 4, 1.2);
