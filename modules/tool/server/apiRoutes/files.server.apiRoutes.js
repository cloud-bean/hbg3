var path = require('path');
var files = require('../controllers/files.server.controller.js');
var oAuth2Helper = require(path.resolve('./config/helper/auth'));
var express = require('express');
var router = express.Router();

router.get('/tool/files',
    oAuth2Helper.requiresOAuthLogin,
    files.list);

router.post('/tool/files', files.upload);
router.post('/tool/files/:location', files.upload);

module.exports = router;
