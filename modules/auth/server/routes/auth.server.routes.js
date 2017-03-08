'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
    path = require('path'),
    auth = require('../controllers/auth.server.controller'),
    users = require('../controllers/user.server.controller'),
    authHelper = require(path.resolve('./config/helper/auth'));

module.exports = function (app) {
    // User Routes


    // admin for user management, not exposed as API
    app.route('/app/auth/signup').post(auth.signup);
    app.route('/app/auth/signin').post(auth.signin);
    app.route('/app/auth/signout').get(auth.signout);

    app.route('/app/auth/users')
        .all(authHelper.isAllowed)
        .get(users.list)
        .post(users.create);

    app.route('/app/auth/user/:userId/password')
        .all(authHelper.isAllowed)
        .get(users.changePasswordRandom)
        .put(users.changePassword);
    app.post('/app/auth/password/forgot', users.passwordForgot);//forgot password
    app.get('/app/auth/password/forgot/:token', users.findPassword);//verification token
    app.patch('/app/auth/password/forgot/change', users.changePasswordByToken);//change password by token

    app.route('/app/auth/users/:userId')
        .all(authHelper.isAllowed)
        .put(users.update)
        .delete(users.delete);
    app.route('/app/auth/users/:userId/status').put(authHelper.isAllowed, users.activateUser);

    app.route('/app/auth/users/status/:token').get(users.activeUserByToken);

    app.param('userId', users.userByID);
};
