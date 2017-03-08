(function () {
    'use strict';

    var passport = require('passport'),
        path = require('path'),
        express = require('express'),
        router = express.Router(),
        authHelper = require(path.resolve('./config/helper/auth')),
        policy = require('../controllers/policy.server.controller');

    router.post('/policy', authHelper.isAuthAllowed, policy.getPolicy);

    module.exports = router;
}());
