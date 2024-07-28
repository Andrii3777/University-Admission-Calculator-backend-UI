const { Router } = require('express');
const authController = require('../controllers/authController');
const enrollController = require('../controllers/enrollController');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

const router = Router();

// Middleware to check user for all routes
router.get('*', checkUser);

// Routes for rendering
router.get('/', (req, res) => res.render('home'));
router.get('/signup', (req, res) => res.render('signup'));
router.get('/login', (req, res) => res.render('login'));
router.get('/calculator', requireAuth, (req, res) => res.render('calculator'));

// Routes for authentication and enrollment
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/enroll', requireAuth, enrollController.enroll);
router.get('/getStudentScores', requireAuth, enrollController.getStudentScores);

module.exports = router;
