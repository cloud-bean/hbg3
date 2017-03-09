(function () {
    'use strict';

    var passport = require('passport'),
        path = require('path'),
        express = require('express'),
        router = express.Router(),
        user = require('../controllers/user.server.controller'),
        authHelper = require(path.resolve('./config/helper/auth'));

    router
        .param('userId', user.userByID)
        .post('/users', authHelper.isAuthAllowed, user.create)
        .get('/users/:userId', authHelper.isAuthAllowed, user.userInfo)
        .put('/users/:userId', authHelper.isAuthAllowed, user.update)
        .post('/users/password/forgot', user.passwordForgot)
        .get('/users/password/retrieve/:email', user.changePasswordRandom)
        .get('/users/password/token/:token', user.getResetPasswordToken)
        .get('/users/status/:token', user.activeUserByToken)
        .patch('/users/password/reset', user.changePasswordByToken)
        .post('/users/attribute/inspect', authHelper.isAuthAllowed, user.inspect)
        .post('/users/:userId/change/password', authHelper.isAuthAllowed, user.changePassword);
    module.exports = router;
}());
