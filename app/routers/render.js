const router = require('express').Router();

const userRenderRoute = require('./user_render');
const adminRenderRoute = require('./admin_render');

router.use('/', userRenderRoute);
router.use('/a', adminRenderRoute);

module.exports = router;
