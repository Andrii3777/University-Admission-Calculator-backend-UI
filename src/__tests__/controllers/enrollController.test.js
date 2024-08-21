const enrollController = require('../../controllers/enrollController');
const tokenService = require('../../services/tokenService');
const enrollService = require('../../services/enrollService');

// Mock dependencies to isolate controller behavior
jest.mock('../../services/tokenService');
jest.mock('../../services/enrollService');

describe('EnrollController', () => {
    let req;
    let res;
    let next;

    // Set up mock request, response, and next objects before each test
    beforeEach(() => {
        req = {
            cookies: {},
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        next = jest.fn();
    });

    describe('enroll', () => {
        it('should return 401 if no valid studentId is found', async () => {
            req.cookies = {}; // Simulate missing access token

            await enrollController.enroll(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith('Invalid Access Token');
        });

        it('should return 400 if there is an error in the enrollService', async () => {
            const studentId = 1;
            req.cookies.accessToken = 'validAccessToken';  // Mock valid access token
            req.body.scores = [/* some scores */];  // Mock scores provided by the student

            // Mock token validation and service responses
            tokenService.validateAccessToken.mockReturnValue({ id: studentId });
            enrollService.enroll.mockResolvedValue({ error: 'Error message' });

            await enrollController.enroll(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error message' });
        });

        it('should return 200 with free specialties if available', async () => {
            const studentId = 1;
            req.cookies.accessToken = 'validAccessToken';  // Mock valid access token
            req.body.scores = [/* some scores */];  // Mock scores provided by the student

            // Mock token validation and service response with free specialties
            tokenService.validateAccessToken.mockReturnValue({ id: studentId });
            enrollService.enroll.mockResolvedValue({
                specialties: {
                    free: ['Specialty1', 'Specialty2'],  // Mock available free specialties
                    paid: []
                }
            });

            await enrollController.enroll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'List of specialties defined successfully',
                type: 'free',
                specialties: ['Specialty1', 'Specialty2']
            });
        });

        it('should return 200 with paid specialties if no free specialties are available', async () => {
            const studentId = 1;
            req.cookies.accessToken = 'validAccessToken';  // Mock valid access token
            req.body.scores = [/* some scores */];  // Mock scores provided by the student

            // Mock token validation and service response with paid specialties
            tokenService.validateAccessToken.mockReturnValue({ id: studentId });
            enrollService.enroll.mockResolvedValue({
                specialties: {
                    free: [],
                    paid: ['Specialty3', 'Specialty4']  // Mock available paid specialties
                }
            });

            await enrollController.enroll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'List of specialties defined successfully',
                type: 'paid',
                specialties: ['Specialty3', 'Specialty4']
            });
        });

        it('should return 200 with no specialties available if both free and paid specialties are empty', async () => {
            const studentId = 1;
            req.cookies.accessToken = 'validAccessToken';  // Mock valid access token
            req.body.scores = [/* some scores */];  // Mock scores provided by the student

            // Mock token validation and service response with no available specialties
            tokenService.validateAccessToken.mockReturnValue({ id: studentId });
            enrollService.enroll.mockResolvedValue({
                specialties: {
                    free: [],
                    paid: []
                }
            });

            await enrollController.enroll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'List of specialties defined successfully',
                type: 'none',
                specialties: 'No specialties available for the provided scores.'
            });
        });
    });

    describe('getStudentScores', () => {
        it('should return 401 if no valid studentId is found', async () => {
            req.cookies = {}; // Simulate missing access token

            await enrollController.getStudentScores(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith('Invalid Access Token');
        });

        it('should return student scores if studentId is valid', async () => {
            const studentId = 1;
            const mockScores = { math: 95, physics: 90 };
            req.cookies.accessToken = 'validAccessToken';

            // Mock token validation and service response with student scores
            tokenService.validateAccessToken.mockReturnValue({ id: studentId });
            enrollService.getStudentScores.mockResolvedValue(mockScores);

            await enrollController.getStudentScores(req, res);

            expect(res.json).toHaveBeenCalledWith({ scores: mockScores });
        });
    });
});
