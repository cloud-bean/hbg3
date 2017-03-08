'use strict';

var user,
    agent,
    userInfo,
    oauthInfo,
    clientInfo,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('user'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express')),
    AccessToken = mongoose.model('accessToken');


describe('api test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginAdminuser(agent, done);
        clientInfo = mockData.requests.clients[0];
        user = mockData.requests.users.user[0];
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('user cur test', function () {
        it('should without errors when create user', function (done) {
            agent.post('/api/base/users')
                .set('Content-Type', 'application/json')
                .send(user)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_CREATE_DATA_OK');
                    done();
                });
        });

        it('no client info should not login ', function (done) {
            var loginInfo = {
                username: user.email,
                password: user.password
            };

            agent.post('/oauth/token')
                .set('Content-Type', 'application/json')
                .send(loginInfo)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.error.text, 'Unauthorized');
                    done();
                });
        });

        it('should error when user login with error password', function (done) {
            var loginInfo = {
                client_id: clientInfo.clientID,
                client_secret: clientInfo.clientSecret,
                grant_type: 'password',
                username: user.email,
                password: 'errorPasswordTest'
            };

            agent.post('/oauth/token')
                .set('Content-Type', 'application/json')
                .send(loginInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_PASSWORD_ERR');
                    done();
                });
        });

        it('should without errors when user login with client info', function (done) {
            var loginInfo = {
                client_id: clientInfo.clientID,
                client_secret: clientInfo.clientSecret,
                grant_type: 'password',
                username: user.email,
                password: user.password
            };

            agent.post('/oauth/token')
                .set('Content-Type', 'application/json')
                .send(loginInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    oauthInfo = res.body;
                    User.load({criteria: {email: user.email}}, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        userInfo = user;
                        should.equal(oauthInfo.user_id, userInfo._id);
                        done();
                    });
                });
        });

        it('should without errors when update user info', function (done) {
            userInfo.firstName = 'Test';
            userInfo.lastName = 'gavin';

            agent.put('/api/base/users/' + userInfo._id)
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .send(userInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    User.load({criteria: {email: user.email}}, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        should.equal(user.firstName, userInfo.firstName);
                        should.equal(user.lastName, userInfo.lastName);
                        done();
                    });
                });
        });

        it('should without errors when get user info', function (done) {
            agent.get('/api/base/users/' + userInfo._id)
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(user.email, res.body.data.email);
                    done();
                });
        });

    });

    describe('change password test', function () {
        var passwordInfo = {};

        it('should error when change password with error old password', function (done) {
            passwordInfo = {
                password: user.password,
                newPassword: 'changePwd',
                confirmPassword: 'changePwd'
            };

            passwordInfo.password = 'errorOldPassword';
            agent.post('/api/base/users/' + userInfo._id + '/change/password')
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .send(passwordInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_OLD_PASSWORD_ERR');
                    done();
                });
        });

        it('should change password error when newPassword not equal confirmPassword', function (done) {
            passwordInfo.password = user.password;
            passwordInfo.confirmPassword = 'errorChangePassword';

            agent.post('/api/base/users/' + userInfo._id + '/change/password')
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .send(passwordInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_NEW_PASSWORD_ERR');
                    done();
                });
        });

        it('should without errors when change password', function (done) {
            passwordInfo.newPassword = passwordInfo.confirmPassword;

            agent.post('/api/base/users/' + userInfo._id + '/change/password')
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .send(passwordInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_NEW_PASSWORD_LOGIN');
                    done();
                });
        });
    });

    describe('access token error test', function () {
        it('should error when get info with out of date access token', function (done) {
            AccessToken.findOne({token: oauthInfo.access_token}, function (err, accessTokenInfo) {
                var fiveMinAgo = (new Date((new Date()).getTime() - (5 * 60 * 1000 + 1))).toLocaleString();
                accessTokenInfo.created = fiveMinAgo;
                accessTokenInfo.updated = fiveMinAgo;

                accessTokenInfo.save(function (err, newToken) {
                    if (err) {
                        return done(err);
                    }

                    agent.get('/api/base/users/' + userInfo._id)
                        .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                        .expect(401)
                        .end(function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            should.equal(res.body.code, 'CMSV_EXPIRED_TOKEN_ERR');
                            done();
                        });
                });
            });
        });

        it('get user info with error when use error access token', function (done) {
            agent.get('/api/base/users/' + userInfo._id)
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token + 'error')
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_INVALID_TOKEN_ERR');
                    done();
                });
        });
    });

    describe('refresh token test', function () {
        it('should without error when refresh token', function (done) {
            var regreshInfo = {
                client_id: clientInfo.clientID,
                client_secret: clientInfo.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: oauthInfo.refresh_token
            };

            agent.post('/oauth/token')
                .set('Content-Type', 'application/json')
                .send(regreshInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.user_id, userInfo._id);
                    oauthInfo = res.body;
                    done();
                });
        });

        it('should without errors when get user info with new access token', function (done) {
            agent.get('/api/base/users/' + userInfo._id)
                .set('Authorization', oauthInfo.token_type + ' ' + oauthInfo.access_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.data.email, userInfo.email);
                    done();
                });
        });

    });

    describe('forgot password test', function () {
        var resetPasswordToken = '';

        it('forgot password should error when email not exist', function (done) {
            agent.post('/api/base/users/password/forgot')
                .set('Content-Type', 'application/json')
                .send({email: 'error email', resetUrl: 'localhost:38254/test/set/password/'})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_NOT_FOUND_ERR');
                    done();
                });
        });

        it('should without errors when forgot password with right email', function (done) {
            agent.post('/api/base/users/password/forgot')
                .set('Content-Type', 'application/json')
                .send({
                    email: userInfo.email,
                    resetUrl: 'localhost:38254/test/set/password/'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_EMAIL_SEND_OK');
                    done();
                });
        });

        it('should without errors when test resetPasswordToken can be use', function (done) {
            User.load({criteria: {email: userInfo.email}}, function (err, user) {
                if (err) {
                    return done(err);
                }
                resetPasswordToken = user.resetPasswordToken;
                agent.get('/api/base/users/password/token/' + resetPasswordToken)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        should.equal(res.body.code, 'success');
                        done();
                    });
            });
        });
    });
});
