const router = require('express').Router();
const authController = require('./lib/controllers');
const authMiddleware = require('./lib/middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/checkuseraddress', authController.checkuseraddress);
router.post('/logout', authMiddleware.verifyToken, authController.logout);


router.post('/adminlogin', authController.adminlogin);
router.post('/passwordreset', authController.passwordReset);

// This token is different from JWT
router.get('/reset/:token', authController.passwordResetGet);
router.post('/reset/:token', authController.passwordResetPost);

module.exports = router;
