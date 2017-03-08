/**
 * Created by root on 8/2/2015.
 */

'use strict';

var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var path = require('path');
var config = require(path.resolve('./config/config'));
var mongoose = require('mongoose');
var responseHandler = require(path.resolve('./config/helper/responseHelper'));
var User = mongoose.model('user');
var AccessToken = mongoose.model('accessToken');
var RefreshToken = mongoose.model('refreshToken');
var Client = mongoose.model('client');
var async = require('async');
// create OAuth 2.0 server
var server = oauth2orize.createServer();
var _ = require('lodash');
var userController = require('./user.server.controller');

// Generic error handler
var errFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, rememberMe, done) {

    // curries in `done` callback so we don't need to pass it
    var removeRefreshToken = function (done) {
        RefreshToken.remove(data, done);
    };

    var removeAccessToken = function (result, done) {
        AccessToken.remove(data, done);
    };

    var saveRefreshToken = function (result, done) {
        var refreshToken = new RefreshToken({
            token: crypto.randomBytes(32).toString('hex'),
            user: data.user,
            rememberMe: rememberMe,
            client: data.client
        });
        refreshToken.save(function (err) {
            done(err, refreshToken.token);
        });
    };

    var saveAccessToken = function (refreshToken, done) {
        var accessToken = new AccessToken({
            token: crypto.randomBytes(32).toString('hex'),
            user: data.user,
            client: data.client
        });
        accessToken.save(function (err, newObj) {
            done(err, {
                accessToken: newObj.token,
                refreshToken: refreshToken
            });
        });
    };

    async.waterfall([
        removeRefreshToken,
        removeAccessToken,
        saveRefreshToken,
        saveAccessToken
    ], function (err, result) {
        return done(err, result.accessToken, {
            'refresh_token': result.refreshToken,
            'expires_in': config.token.userTokenLife,
            'user_id': data.user
        });
    });
};

server.serializeClient(function (client, done) {
    return done(null, client.clientID);
});

server.deserializeClient(function (id, done) {
    Client.findOne({
        clientID: id
    }, function (error, client) {
        if (error) return done(error);
        return done(null, client);
    });
});
// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, body, done) {

    User.findOne({
        email: username.toLowerCase()
    }, function (err, user) {

        if (err) {
            return done(err);
        }

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

        var model = {
            user: user._id,
            client: client._id
        };

        generateTokens(model, body.rememberMe, done);
    });

}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {

    RefreshToken.findOne({
        token: refreshToken
    }, function (err, token) {
        if (err) {
            return done(err);
        }

        if (!token) {
            return done(null, 'Invalide Refresh Token', responseHandler.getResponseData('CMSV_INVALID_REFRESH_TOKEN_ERR'));
        }

        var compareTime = token.rememberMe ? config.token.userRefreshTokenLongLife : config.token.userRefreshTokenShortLife;
        if (Date.now() > (token.created.getTime() + compareTime)) {
            return done(null, 'Refresh Token Expired', responseHandler.getResponseData('CMSV_EXPIRED_REFRESH_TOKEN_ERR'));
        }

        User.findOne({
            _id: token.user
        }, function (err, user) {
            if (err) {
                return done(err);
            }

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

            var model = {
                user: user._id,
                client: client._id
            };

            generateTokens(model, token.rememberMe, done);
        });
    });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {
        session: false
    }),
    server.token(),
    server.errorHandler()
];

exports.externalToken = [
    passport.authenticate(['oauth2-client-password'], {
        session: false
    }),
    function (req, res, next) {
        var userInfo = req.body;
        var findCriteria = {
            provider: userInfo.provider,
            'providerData.id': userInfo.providerData.id
        };

        var sendAuthInfo = function (user) {
            Client.findOne({clientID: userInfo.client_id}, function (err, client) {
                generateTokens({
                    client: client._id,
                    user: user._id
                }, null, function (err, accessToken, info) {
                    _.extend(info, {
                        access_token: accessToken,
                        grant_type: 'Bearer',
                        firstBind: user.firstBind
                    });
                    return res.send(responseHandler.getSuccessData(info));
                });
            });
        };

        User.findOne(findCriteria, function (err, user) {
            if (user) {
                user.firstBind = false;
                user.save(function (err, newUserInfo) {
                    if (err) {
                        return res.send(responseHandler.getMongoErrorMessage(err));
                    } else if (user.status !== -1) {
                        sendAuthInfo(newUserInfo);
                    } else {
                        return res.send(responseHandler.getSuccessData('CMSV_INACTIVE_USER'));
                    }
                });
            } else {
                userInfo.firstBind = true;
                userInfo.email = '';//clear email info, just bind third party info.
                userController.saveUser(userInfo, function (err, newUser) {
                    if (err) {
                        return res.send(responseHandler.getMongoErrorMessage(err));
                    } else {
                        sendAuthInfo(newUser);
                    }
                });
            }
        });
    }
];
