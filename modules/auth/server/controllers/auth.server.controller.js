/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 06/03/2015.
 */

'use strict';

var passport = require('passport'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    mailer = require(path.resolve('./config/helper/mailHelper')),
    mongoose = require('mongoose'),
    User = mongoose.model('user'),
    async = require('async'),
    responseHandler = require(path.resolve('./config/helper/responseHelper'));


exports.signin = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (info && info.code) {
            return res.json(info);
        }

        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.send(responseHandler.getSuccessData(user));
        });
    })(req, res, next);
};

exports.oauthCallback = function (strategy) {
    return function (req, res, next) {
        passport.authenticate(strategy, function (err, user) {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.send(responseHandler.getSuccessData(user));
            });
        })(req, res, next);
    };
};

exports.signup = function (req, res, next) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    var user = new User(req.body);
    user.displayName = user.firstName + ' ' + user.lastName;
    user.password = User.randomPassword();

    user.save(function (err) {
        if (err) {
            next(err);
        } else {
            mailer.sendTemplate(user.email, 'create-user', {
                email: user.email,
                displayName: user.displayName,
                password: user.password
            });
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_CREATE_DATA_OK',
                messageInfo: ['User', user.email, 'An initial password has been sent to the user email.']
            }));
        }
    });
};

exports.signout = function (req, res) {
    req.logOut();
    return res.send(responseHandler.getSuccessData());
};
