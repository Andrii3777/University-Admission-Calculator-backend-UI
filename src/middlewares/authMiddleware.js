const tokenService = require('../services/tokenService.js');
const authController = require('../controllers/authController');

/**
 * Middleware to ensure the request is authenticated.
 * If the access token is missing or invalid, it attempts to refresh the token.
 */
const requireAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            await authController.refresh(req, res, next);
            return; // Exit early to avoid executing the next middleware
        }

        const isValid = tokenService.validateAccessToken(accessToken);

        if (!isValid) {
            return res.redirect('/api/v1/login/');
        }

        next();
    } catch (error) {
        res.status(error?.status || 500).json({ error: error?.message || 'Internal Server Error' });
    }
};

/**
 * Middleware to check if the user is authenticated and attach the email to res.locals.
 */
const checkUser = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken && !refreshToken) {
            res.locals.email = null;
            return next();
        }

        const payloadAccess = tokenService.validateAccessToken(accessToken);
        const payloadRefresh = tokenService.validateRefreshToken(refreshToken);

        res.locals.email = payloadAccess?.email || payloadRefresh?.email || null;

        next();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        //console.error('Error during user check:', error);
        res.locals.email = null;
        next();
    }
};

module.exports = { requireAuth, checkUser };