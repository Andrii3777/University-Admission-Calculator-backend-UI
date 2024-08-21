const { requireAuth, checkUser } = require('../../middlewares/authMiddleware');
const tokenService = require('../../services/tokenService');
const authController = require('../../controllers/authController');

jest.mock('../../services/tokenService');
jest.mock('../../controllers/authController');

describe('Auth Middleware', () => {
    // Helper function to create mock request objects with cookies
    const mockRequest = (accessToken, refreshToken) => ({
        cookies: {
            accessToken,
            refreshToken,
        }
    });

    // Helper function to create mock response objects
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        res.locals = {};
        return res;
    };

    const mockNext = jest.fn();

    afterEach(() => {
        // Clear all mock calls after each test
        jest.clearAllMocks();
    });

    describe('requireAuth', () => {
        it('should call authController.refresh if access token is missing', async () => {
            const req = mockRequest(null, null);
            const res = mockResponse();

            await requireAuth(req, res, mockNext);

            // Verify that authController.refresh is called when access token is missing
            expect(authController.refresh).toHaveBeenCalledWith(req, res, mockNext);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should redirect to login if access token is invalid', async () => {
            const req = mockRequest('invalidToken', null);
            const res = mockResponse();
            tokenService.validateAccessToken.mockReturnValue(null);

            await requireAuth(req, res, mockNext);

            // Verify that the user is redirected to the login page if the access token is invalid
            expect(res.redirect).toHaveBeenCalledWith('/api/v1/login/');
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should call next if access token is valid', async () => {
            const req = mockRequest('validToken', null);
            const res = mockResponse();
            tokenService.validateAccessToken.mockReturnValue(true);

            await requireAuth(req, res, mockNext);

            // Verify that next() is called if the access token is valid
            expect(mockNext).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should handle errors and respond with a 500 status', async () => {
            const req = mockRequest('validToken', null);
            const res = mockResponse();
            tokenService.validateAccessToken.mockImplementation(() => { throw new Error('Test Error'); });

            await requireAuth(req, res, mockNext);

            // Verify that a 500 status is returned and error message is sent if an error occurs
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('checkUser', () => {
        it('should set res.locals.email to null if no tokens are present', async () => {
            const req = mockRequest(null, null);
            const res = mockResponse();

            await checkUser(req, res, mockNext);

            // Verify that res.locals.email is set to null if no tokens are provided
            expect(res.locals.email).toBeNull();
            expect(mockNext).toHaveBeenCalled();
        });

        it('should set res.locals.email to payloadAccess.email if access token is valid', async () => {
            const req = mockRequest('validAccessToken', null);
            const res = mockResponse();
            tokenService.validateAccessToken.mockReturnValue({ email: 'user@example.com' });
            tokenService.validateRefreshToken.mockReturnValue(null);

            await checkUser(req, res, mockNext);

            // Verify that res.locals.email is set to the email from the valid access token payload
            expect(res.locals.email).toBe('user@example.com');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should set res.locals.email to payloadRefresh.email if refresh token is valid and access token is invalid', async () => {
            const req = mockRequest(null, 'validRefreshToken');
            const res = mockResponse();
            tokenService.validateAccessToken.mockReturnValue(null);
            tokenService.validateRefreshToken.mockReturnValue({ email: 'user@example.com' });

            await checkUser(req, res, mockNext);

            // Verify that res.locals.email is set to the email from the valid refresh token payload
            expect(res.locals.email).toBe('user@example.com');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should set res.locals.email to null if both tokens are invalid', async () => {
            const req = mockRequest('invalidAccessToken', 'invalidRefreshToken');
            const res = mockResponse();
            tokenService.validateAccessToken.mockReturnValue(null);
            tokenService.validateRefreshToken.mockReturnValue(null);

            await checkUser(req, res, mockNext);

            // Verify that res.locals.email is set to null if both tokens are invalid
            expect(res.locals.email).toBeNull();
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle errors and set res.locals.email to null', async () => {
            const req = mockRequest('validAccessToken', 'validRefreshToken');
            const res = mockResponse();
            tokenService.validateAccessToken.mockImplementation(() => { throw new Error('Test Error'); });

            await checkUser(req, res, mockNext);

            // Verify that res.locals.email is set to null if an error occurs
            expect(res.locals.email).toBeNull();
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
