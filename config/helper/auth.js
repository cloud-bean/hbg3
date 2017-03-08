/**
 * Copyright 2014 Erealm Info & Tech.
 *
 * Created by ken on 06/03/2015.
 */

'use strict';

var passport = require('passport'),
    path = require('path'),
    acl = require('acl'),
    config = require('../config'),
    responseHandler = require(path.resolve('./config/helper/responseHelper'));

acl = new acl(new acl.memoryBackend());

exports.init = function () {
    // Using the memory backend
    config.files.server.policies.forEach(function (policyPath) {
        require(path.resolve(policyPath)).invokeRolesPolicies(acl);
    });
};
exports.requiresLogin = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    if (req.xhr) {
        return res.send(responseHandler.getResponseData({code: '600'}));
    } else {
        return res.redirect('/login');
    }
};

exports.requiresOAuthLogin = passport.authenticate('bearer', {session: false});

exports.isAuthAllowed = function (req, res, next) {
    passport.authenticate('bearer', {
        session: false
    }, function (err, user, info) {
        if (info && info.code) {
            return res.status(401).send(responseHandler.getResponseData(info.code));
        }
        var roles = (user && user.roles) ? user.roles : ['guest'];
        req.user = user;

        // check ENV setting, if DEBUG_ALLOW_ADMIN_ACCESS_API mode,
        if (config.allowAdminAccessAPI === 'allow') {
            if (roles.indexOf('admin') !== -1 || roles.indexOf('superuser') !== -1) {
                roles.push('user');
            }
        }

        acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
            if (err) {
                // An authorization error occurred.
                return res.send(responseHandler.getResponseData());
            } else {
                if (isAllowed) {
                    // Access granted! Invoke next middleware
                    return next();
                } else {
                    return res.status(403).send(responseHandler.getResponseData('403'));
                }
            }
        });
    })(req, res, next);
};

exports.isAllowed = function (req, res, next) {
    var user = req.user;
    var roles = (user) ? user.roles : ['guest'];

    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.send(responseHandler.getResponseData());
        } else {
            if (isAllowed) {

                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).send(responseHandler.getResponseData('403'));
            }
        }
    });
};
