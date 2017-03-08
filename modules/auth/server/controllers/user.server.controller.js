/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 06/03/2015.
 */

'use strict';
var path = require('path');
var config = require(path.resolve('./config/config'));
var mongoose = require('mongoose');
var User = mongoose.model('user');
var AccessToken = mongoose.model('accessToken');
var RefreshToken = mongoose.model('refreshToken');
var mailer = require(path.resolve('./config/helper/mailHelper'));
var responseHandler = require(path.resolve('./config/helper/responseHelper'));
var async = require('async');
var crypto = require('crypto');
var url = require('url');

var saveUser = function (newUserInfo, callback) {
    var checkDuplicateFiled = function (done) {
        var patternAttr = [];
        if (newUserInfo.email) {
            patternAttr.push({email: newUserInfo.email});
        }
        if (newUserInfo.username) {
            patternAttr.push({username: newUserInfo.username});
        }
        if (patternAttr.length > 0) {
            User.loadAll({
                criteria: {$or: patternAttr}
            }, function (err, existUsers) {
                if (err) {
                    done(err);
                } else if (!existUsers) {
                    done(null, newUserInfo);
                } else {
                    var duplicateFiled = '';
                    var userInfoDuplicate = existUsers.some(function (existUser) {
                        if (newUserInfo.username && newUserInfo.username === existUser.username) {
                            duplicateFiled = 'username';
                        } else if (newUserInfo.email && newUserInfo.email === existUser.email) {
                            duplicateFiled = 'email';
                        }
                        return !!duplicateFiled;
                    });
                    if (userInfoDuplicate) {
                        done({
                            isFormat: true,
                            data: responseHandler.getResponseData({
                                code: 'CMSV_DUPLICATE_ERR',
                                messageInfo: [newUserInfo[duplicateFiled]]
                            })
                        });
                    } else {
                        done(null, newUserInfo);
                    }
                }
            });
        } else {
            done(null, newUserInfo);
        }
    };

    var setUserInfo = function (userInfo, done) {
        var randomPassword = User.randomPassword();

        var user = new User(userInfo);

        if (userInfo.isAdmin) {
            user.roles = ['admin'];
        } else {
            user.roles = ['user'];
        }

        if (!userInfo.displayName) {
            user.displayName = user.firstName + ' ' + (user.middleName ? (user.middleName + ' ') : '') + user.lastName;
        }

        if (userInfo.password || (userInfo.provider && userInfo.provider !== 'local')) {
            user.status = 1;
        } else {
            user.password = randomPassword;
            user.status = 0; // first login.
            userInfo.randomPassword = randomPassword;
        }

        if (userInfo.requireConfirm) {
            user.status = 2;
            crypto.randomBytes(20, function (err, buf) {
                user.activeToken = buf.toString('hex');
                done(null, {userInfo: userInfo, user: user});
            });
        } else {
            done(null, {userInfo: userInfo, user: user});
        }
    };

    var createUser = function (userData, done) {
        var user = userData.user,
            userInfo = userData.userInfo;
        user.save(function (err, newUser) {
            if (err) {
                done(err);
            } else {
                var currentUserEmailTemplate = ['create-user', 'create-user-with-password', 'create-user-confirm'][user.status];
                mailer.sendTemplate(user.email, currentUserEmailTemplate, {
                    email: newUser.email,
                    displayName: newUser.displayName || newUser.email,
                    password: userInfo.randomPassword,
                    activeToken: newUser.activeToken,
                    activeURL: userInfo.activeURL
                });
                done(null, newUser);
            }
        });
    };

    async.waterfall([checkDuplicateFiled, setUserInfo, createUser], function (err, result) {
        callback(err, result);
    });
};

exports.saveUser = saveUser;

exports.create = function (req, res, next) {
    var userInfo = req.body;
    userInfo.activeURL = userInfo.activeURL
        || url.format({
            protocol: req.protocol,
            host: req.headers.host,
            pathname: '/authentication/active/'
        });
    saveUser(userInfo, function (err, newUser) {
        if (err) {
            if (err.isFormat) {
                return res.send(err.data);
            } else {
                return res.send(responseHandler.getMongoErrorMessage(err));
            }
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_CREATE_DATA_OK',
                messageInfo: ['User', newUser.email]
            }));
        }
    });
};

exports.inspect = function (req, res, next) {
    var queryInfo = req.body.queryInfo;
    User.loadAll({criteria: {$or: queryInfo}}, function (err, users) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            var checkResult = {};
            users.forEach(function (user) {
                queryInfo.forEach(function (item) {
                    var itemKey = Object.keys(item)[0];
                    var itemEqual = (user[itemKey] === item[itemKey]),
                        idEqual = (req.user && req.user._id.toString() === user._id.toString());
                    checkResult[itemKey] = itemEqual && !idEqual;
                });
            });
            return res.send(responseHandler.getSuccessData(checkResult));
        }
    });
};

exports.update = function (req, res, next) {
    var userInfo = req.body;
    var user = req.model;
    var authUser = req.user;
    if (authUser.roles.length === 1
        && authUser.roles.indexOf('user') > -1
        && (authUser._id.toString() !== user._id.toString())) {

        //user can't modify other user info
        return res.status(403).send(responseHandler.getResponseData('403'));
    }

    if (userInfo.email && (user.email !== userInfo.email)) {
        user.email = userInfo.email;
        //todo for safe, send email to user, and if user confirmed change, then user email will be change success
    }

    if (userInfo.displayName) {
        user.displayName = userInfo.displayName;
    }

    if (userInfo.username) {
        user.username = userInfo.username;
    }

    if (userInfo.firstName || userInfo.middleName || userInfo.lastName) {
        user.firstName = userInfo.firstName || user.firstName;
        user.middleName = userInfo.middleName || user.middleName;
        user.lastName = userInfo.lastName || user.lastName;
        user.displayName = user.firstName + ' ' + (user.middleName ? (user.middleName + ' ') : '') + user.lastName;
    }

    user.profileImageURL = userInfo.profileImageURL || user.profileImageURL;
    user.roles = userInfo.roles || user.roles;
    user.gender = userInfo.gender || user.gender;

    if (req.body.option) {
        user.option = userInfo.option;
        user.markModified('option');
    }

    user.save(function (err, newUser) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_UPDATE_DATA_OK',
                messageInfo: ['User ', newUser.email]
            }));
        }
    });
};

exports.userInfo = function (req, res, next) {
    return res.send(responseHandler.getSuccessData(req.model));
};

exports.list = function (req, res, next) {
    var roles = [];
    if (req.query.roles && req.query.roles.trim().length) {
        req.query.roles.split(',').forEach(function (item) {
            var tmpRole = item.trim().toLowerCase();
            if (tmpRole.length && tmpRole !== 'superuser') {
                roles.push(tmpRole);
            }
        });
    }

    var options = {
        searchText: req.query.searchText || '',
        criteria: {roles: roles.length ? {$in: roles} : {$nin: ['superuser']}}
    };

    if (options.searchText && (options.searchText.trim().length !== 0)) {
        var searchTextRegEx = new RegExp(escape(options.searchText.trim()), 'i');
        options.criteria.$or = [
            {
                email: {
                    $regex: searchTextRegEx
                }
            },
            {
                displayName: {
                    $regex: searchTextRegEx
                }
            }
        ];
    }

    User.count(options.criteria, function (err, count) {
        var totalCount = count;
        options.page = req.query.page;
        options.limit = req.query.limit;
        User.userPagination(options, function (err, users) {
            if (err) {
                res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                res.header('x-total-items-count', totalCount);
                res.send(responseHandler.getSuccessData(users));
            }

        });
    });
};

exports.delete = function (req, res) {
    var user = req.model;
    user.remove(function (err) {
        if (err) {
            return res.send(responseHandler.getResponseData('400'));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_DELETE_DATA_OK',
                messageInfo: ['User', '-1']
            }));
        }
    });
};

exports.changePassword = function (req, res, next) {
    var userId = req.model._id;
    User.findById(userId).exec(function (err, user) {
        var oldPass = req.body.password;
        var newPass = req.body.newPassword;
        var newPassConfirm = req.body.confirmPassword;

        if (!oldPass || !newPass || newPass.length < 6 || oldPass === newPass) {
            return res.send(responseHandler.getResponseData('CMSV_INVALID_PARAM'));
        }
        if (newPassConfirm !== newPass) {
            return res.send(responseHandler.getResponseData('CMSV_NEW_PASSWORD_ERR'));
        }

        var isAuth = user.authenticate(req.body.password);

        if (isAuth) {
            user.password = req.body.newPassword;
            user.status = 1;

            var removeAccessToken = function (callback) {
                AccessToken.remove({user: user._id}, function (err, tank) {
                    callback(err, tank);
                });
            };

            var removeRefreshToken = function (callback) {
                RefreshToken.remove({user: user._id}, function (err, tank) {
                    callback(err, tank);
                });
            };

            var saveUser = function (err, result) {
                if (err) {
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    user.save(function (err) {
                        if (err) {
                            return next(err);
                        } else {
                            mailer.sendTemplate(user.email, 'change-password', {
                                displayName: user.displayName,
                                email: user.email
                            });
                            return res.send(responseHandler.getResponseData({
                                code: 'CMSV_NEW_PASSWORD_LOGIN',
                                messageInfo: ['change']
                            }));
                        }
                    });
                }
            };

            async.parallel([removeAccessToken, removeRefreshToken], saveUser);
        } else {
            return res.send(responseHandler.getResponseData('CMSV_OLD_PASSWORD_ERR'));
        }
    });
};

exports.passwordForgot = function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.load({
                criteria: {email: req.body.email.toLowerCase()}
            }, function (err, user) {
                if (!user || user.status !== 1) {
                    return res.send(responseHandler.getResponseData({
                        code: 'CMSV_NOT_FOUND_ERR',
                        messageInfo: ['User']
                    }));
                }

                var expiresTime = Date.now() + 3600000; // 1 hours

                user.resetPasswordToken = token;
                user.resetPasswordExpires = expiresTime;
                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            mailer.sendTemplate(user.email, 'forgot-password', {
                token: token,
                displayName: user.displayName,
                email: user.email,
                resetUrl: req.body.resetUrl || url.format({
                    protocol: req.protocol,
                    host: req.headers.host,
                    pathname: '/app/auth/password/forgot/'
                })
            });

            return res.send(responseHandler.getResponseData('CMSV_EMAIL_SEND_OK'));
        }
    ], function (err) {
        if (err) return next(err);
        return res.send(responseHandler.getResponseData());
    });
};

exports.getResetPasswordToken = function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        }
        if (!user) {
            return res.send(responseHandler.getSuccessData({isTokenValid: false}));
        }
        return res.send(responseHandler.getSuccessData({isTokenValid: true}));
    });
};

exports.findPassword = function (req, res, next) {
    User.findOne(
        {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        },
        function (err, user) {
            if (err || !user) {
                return res.render('modules/core/server/views/400');
            }
            return res.render('modules/core/server/views/findPassword', {_token: req.params.token});
        }
    );
};

exports.changePasswordByToken = function (req, res, next) {
    async.waterfall([
        function (done) {
            User.load(
                {
                    criteria: {
                        resetPasswordToken: req.body.token,
                        resetPasswordExpires: {
                            $gt: Date.now()
                        }
                    }
                },
                function (err, user) {
                    if (!user) {
                        return res.send(responseHandler.getResponseData({
                            code: 'CMSV_NOT_FOUND_ERR',
                            messageInfo: ['User']
                        }));
                    }

                    if (req.body.newPassword !== req.body.confirmPassword || req.body.newPassword.length < 6) {
                        return res.send(responseHandler.getResponseData('CMSV_INVALID_PARAM'));
                    }

                    user.password = req.body.newPassword;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function (err, tank) {
                        if (err) {
                            next(err);
                        } else {
                            done(err, user);
                        }
                    });
                });
        },
        function (user, done) {
            mailer.sendTemplate(user.email, 'change-password', {
                displayName: user.displayName,
                email: user.email
            });

            return res.send(responseHandler.getResponseData({code: 'CMSV_NEW_PASSWORD_LOGIN', messageInfo: ['reset']}));
        }
    ], function (err) {
        next(err);
    });
};

exports.changePasswordRandom = function (req, res, next) {
    var changeUserPasswordAndStatus = function (user) {
        var newPass = User.randomPassword();
        user.password = newPass;
        user.status = 0;
        user.save(function (err, tank) {
            if (err) {
                next(err);
            } else {
                mailer.sendTemplate(user.email, 'reset-password', {
                    displayName: user.displayName,
                    email: user.email,
                    password: newPass
                });

                return res.send(responseHandler.getResponseData('CMSV_EMAIL_SEND_OK'));
            }
        });
    };

    if (req.params.email) {
        User.load({criteria: {email: req.params.email.toLowerCase()}}, function (err, user) {
            if (err) {
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else if (!user) {
                return res.send(responseHandler.getResponseData({code: 'CMSV_NOT_FOUND_ERR', messageInfo: ['User']}));
            } else {
                changeUserPasswordAndStatus(user);
            }
        });
    } else {
        changeUserPasswordAndStatus(req.model);
    }
};

/***
 * Active or block a user with userId in the url
 * post {active: true or false, changeReason: string }
 */
exports.activateUser = function (req, res, next) {
    var user = req.model;
    user.status = req.body.active ? 1 : -1;
    user.changeReason = req.body.changeReason || '';
    user.save(function (err, tank) {
        if (err) {
            next(err);
        } else {
            return res.send(responseHandler.getResponseData({
                code: user.status === 1 ? 'CMSV_ACCOUNT_ACTIVE_OK' : 'CMSV_ACCOUNT_BLOCK_OK',
                messageInfo: ['User', user.status]
            }));
        }
    });
};

/*User register require be confirmed*/
exports.activeUserByToken = function (req, res, next) {
    User.load({criteria: {activeToken: req.params.token}}, function (err, user) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else if (!user) {
            return res.send(responseHandler.getResponseData({code: 'CMSV_ACTIVE_TOKEN_INVALID'}));
        } else {
            user.status = 1;
            user.save(function (err, userInfo) {
                if (err) {
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    mailer.sendTemplate(user.email, 'user-active', {
                        email: userInfo.email
                    });
                    return res.send(responseHandler.getSuccessData({active: true}));
                }
            });
        }
    });
};

/**
 * Email middleware
 */
exports.userByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send(responseHandler.getResponseData('400'));
    }

    User.findById(id, '-salt -password')
    .exec(function (err, user) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else if (!user) {
            return res.send(responseHandler.getResponseData('401'));
        }
        req.model = user;
        next();
    });
};
