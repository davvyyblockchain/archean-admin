require('./env');
require('./globals');
require('./transactionTracker');

const abi = process.env.ABI;
const mainContractAddress = process.env.CONTRACT_ADDRESS;
const { mongodb } = require('./app/utils');
const router = require('./app/routers');

mongodb.initialize();
router.initialize();

module.exports = router;
