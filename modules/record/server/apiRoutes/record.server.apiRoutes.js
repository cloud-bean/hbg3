var path = require('path');
var recordCtrl = require('../controllers/record.server.controller');
var authHelper = require(path.resolve('./config/helper/auth'));
var express = require('express');
var router = express.Router();

router.get('/records', authHelper.isAuthAllowed, recordCtrl.list);
router.get('/records/:recordId', authHelper.isAuthAllowed, recordCtrl.read);
router.param('recordId', recordCtrl.recordByID);

module.exports = router;
