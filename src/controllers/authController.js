const tokenService = require('../services/tokenService.js');
const authService = require('../services/authService.js');
const env = require('../config.js');

class AuthController {
    async signup(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.signup(email, password);

            if (result.error) {
                return res.status(400).json(result);
            }

            setTokenCookies(res, result.accessToken, result.refreshToken);

            return res.status(201).json({
                message: 'Student signed up successfully',
                accessToken: result.accessToken
            });
        } catch (error) {
            res.status(error?.status || 500).send({ error: error?.message || error });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            if (result.error) {
                return res.status(401).json(result);
            }

            setTokenCookies(res, result.accessToken, result.refreshToken);

            return res.status(200).json({
                message: 'Student logged in successfully',
                accessToken: result.accessToken
            });
        } catch (error) {
            res.status(error?.status || 500).send({ error: error?.message || error });
        }
    }

    async logout(req, res) {
        try {
            await authService.logout(req.cookies.refreshToken);

            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');

            return res.redirect(env.API_BASE_PATH);
            /* return res.status(204).json({
                message: 'Student logged out successfully'
            }); */
        } catch (error) {
            res.status(error?.status || 500).send({ error: error?.message || error });
        }
    }

    /**
     * Refreshes tokens using the provided refresh token in cookies.
     * @param {object} req - The HTTP request object.
     * @param {object} res - The HTTP response object.
     * @param {function} next - The middleware next function.
     * @returns {void}
     */
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;

            // If no refresh token is found, redirect to the login page.
            if (!refreshToken) {
                return res.redirect(`${env.API_BASE_PATH}/login/`);
                // return res.status(401).json({ error: 'No refresh token provided' });
            }

            const result = await tokenService.refresh(refreshToken);
            if (result.error) {
                return res.redirect('/api/v1/login/');
                //return res.status(401).json(result);
            }

            setTokenCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

            next();
            /* return res.status(200).json({
                message: 'Tokens refreshed successfully',
                accessToken: result.tokens.accessToken,
                studentId: result.studentId
            }); */
        } catch (error) {
            res.status(error?.status || 500).send({ error: error?.message || error });
        }
    }
}

/**
 * Sets the access and refresh tokens as HTTP-only cookies.
 * @param {object} res - The HTTP response object.
 * @param {string} accessToken - The access token to set as a cookie.
 * @param {string} refreshToken - The refresh token to set as a cookie.
 * @returns {void}
 */
function setTokenCookies(res, accessToken, refreshToken) {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,  // Cookie is not accessible via JavaScript.
        maxAge: process.env.ACCESS_TOKEN_AGE_SECONDS * 1000  // Cookie expiry time in milliseconds.
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_TOKEN_AGE_SECONDS * 1000
    });
}

module.exports = new AuthController();
