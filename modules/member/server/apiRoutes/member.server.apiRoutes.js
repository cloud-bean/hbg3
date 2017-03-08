var path = require('path');
var memberCtrl = require('../controllers/member.server.controller');
var authHelper = require(path.resolve('./config/helper/auth'));
var express = require('express');
var router = express.Router();

router.get('/members', authHelper.isAuthAllowed, memberCtrl.list);
router.get('/members/:memberId', authHelper.isAuthAllowed, memberCtrl.read);
router.param('memberId', memberCtrl.memberByID);

module.exports = router;
