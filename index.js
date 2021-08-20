require('./env');
require('./globals');
// require('./transactionTracker');

const { mongodb } = require('./app/utils');
const router = require('./app/routers');

mongodb.initialize();
router.initialize();

module.exports = router;