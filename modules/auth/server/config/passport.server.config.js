/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 06/03/2015.
 */

'use strict';

var mongoose = require('mongoose'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    User = mongoose.model('user'),
    Client = mongoose.model('client'),
    AccessToken = mongoose.model('accessToken'),
    responseHandler = require(path.resolve('./config/helper/responseHelper'));

module.exports = function (app, db) {
    // serialize sessions
    passport.serializeUser(function (user, done) {
        //run once when client singnin.
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        // if client is authenticated, every request will go there, then visit the layout-template in core.views.
        User.load({
            criteria: {
                _id: id,
                status: {
                    $ne: -1
                }
            }
        }, function (err, user) {
            done(err, user);
        });
    });

    // use these strategies
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (username, password, done) {
        if (!username || !password) {
            return done(null, 'Invalid user', responseHandler.getResponseData('CMSV_INACTIVE_USER'));
        }
        var options = {
            criteria: {
                email: username.toLowerCase()
            },
            select: 'displayName email created password salt roles status provider'
        };
        User.load(options, function (err, user) {
            if (err) return done(err);
            if (!user) {
                config.info('Unknown user');
                return done(null, 'Unknown user', responseHandler.getResponseData({
                    code: 'CMSV_NOT_FOUND_ERR',
                    messageInfo: ['User']
                }));
            }
            if (user.status === -1) {
                return done(null, 'Invalid user', responseHandler.getResponseData('CMSV_INACTIVE_USER'));
            }
            if (!user.authenticate(password)) {
                config.info('Invalid password');
                return done(null, 'Invalid password', responseHandler.getResponseData('CMSV_PASSWORD_ERR'));
            }
            return done(null, user);
        });
    }));

    passport.use(new BasicStrategy(function (username, password, done) {
        Client.findOne({
            clientID: username
        }, function (err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== password) {
                return done(null, false);
            }

            return done(null, client);
        });
    }));

    passport.use(new ClientPasswordStrategy(function (clientID, clientSecret, done) {
        Client.findOne({
            clientID: clientID
        }, function (err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
                return done(null, false);
            }

            return done(null, client);
        });
    }));

    passport.use(new BearerStrategy(function (accessToken, done) {
        AccessToken.findOne({
            token: accessToken
        }, function (err, token) {

            if (err) {
                return done(err);
            }

            if (!token) {
                return done(null, 'Invalid Refresh Token', responseHandler.getResponseData('CMSV_INVALID_TOKEN_ERR'));
            }

            if (Date.now() > (token.created.getTime() + config.token.userTokenLife)) {
                AccessToken.remove({
                    token: accessToken
                }, function (err) {
                    if (err) {
                        return done(err);
                    } else {
                        return done(null, 'Token expired', responseHandler.getResponseData('CMSV_EXPIRED_TOKEN_ERR'));
                    }
                });
            } else {
                if (token.user !== null) {
                    User.findById(token.user, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, 'Unknown user', responseHandler.getResponseData({
                                code: 'CMSV_NOT_FOUND_ERR',
                                messageInfo: ['User']
                            }));
                        }
                        if (user.status === -1) {
                            return done(null, 'Invalid user', responseHandler.getResponseData('CMSV_INACTIVE_USER'));
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = {
                            scope: '*'
                        };
                        user.salt = '';
                        user.password = '';
                        return done(null, user, info);
                    });
                } else {
                    //The request came from a client only since userID is null
                    //therefore the client is passed back instead of a user
                    Client.findOne({
                        _id: token.client
                    }, function (err, client) {
                        if (err) {
                            return done(err);
                        }
                        if (!client) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = {
                            scope: '*'
                        };

                        return done(null, client, info);
                    });
                }
            }
        });
    }));

    // Add passport's middleware, after the session has been initialized.
    app.use(passport.initialize());
    app.use(passport.session());
};
