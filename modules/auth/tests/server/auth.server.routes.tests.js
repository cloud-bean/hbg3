'use strict';

var agent,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('user'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express')),
    superUserInfo = mockData.requests.users.super[0],
    adminInfo = mockData.requests.users.admin[0];

describe('app user test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginSuperuser(agent, done);
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('user create and read test', function () {

        it('should without errors when create user', function (done) {
            agent.post('/app/auth/users')
                .set('Content-Type', 'application/json')
                .send(adminInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_CREATE_DATA_OK');
                    done();
                });
        });

        it('should without errors when get user list', function (done) {
            agent.get('/app/auth/users')
                .set('Content-Type', 'application/json')
                .send(adminInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var users = res.body.data;
                    var existUser = users.some(function (user) {
                        if (user.email === adminInfo.email) {
                            adminInfo = user;
                            return true;
                        }
                        return false;
                    });
                    should.equal(res.body.code, 'success');
                    should.equal(existUser, true);
                    done();
                });
        });
    });

    describe('change user status', function () {
        it('should without errors when block user', function (done) {
            agent.put('/app/auth/users/' + adminInfo._id + '/status')
                .set('Content-Type', 'application/json')
                .send({
                    active: false,
                    changeReason: 'change status for test'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_ACCOUNT_BLOCK_OK');
                    done();
                });
        });

        it('should without errors when active user', function (done) {
            agent.put('/app/auth/users/' + adminInfo._id + '/status')
                .set('Content-Type', 'application/json')
                .send({
                    active: true,
                    changeReason: 'change status for test'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_ACCOUNT_ACTIVE_OK');
                    done();
                });
        });
    });

    describe('user update, change password and delete test', function () {
        it('should without errors when update user info', function (done) {
            adminInfo.firstName = 'Test';
            adminInfo.lastName = 'gavin';
            agent.put('/app/auth/users/' + adminInfo._id)
                .set('Content-Type', 'application/json')
                .send(adminInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    // should.equal(res.body.code,'200');
                    User.load({criteria: {email: adminInfo.email}}, function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        should.equal(user.firstName, adminInfo.firstName);
                        should.equal(user.lastName, adminInfo.lastName);
                        done();
                    });
                });
        });

        it('should without errors when reset password by admin', function (done) {
            agent.get('/app/auth/user/' + adminInfo._id + '/password')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_EMAIL_SEND_OK');
                    done();
                });
        });

        it('should without errors when delete user', function (done) {
            agent.delete('/app/auth/users/' + adminInfo._id)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_DELETE_DATA_OK');
                    done();
                });
        });
    });

    describe('change password and forgot password', function () {
        var resetPasswordToken = '';

        it('should without errors when change password', function (done) {
            User.load(
                {
                    criteria: {
                        email: superUserInfo.email
                    }
                },
                function (err, superUser) {
                    if (err) {
                        return done(err);
                    }
                    agent.put('/app/auth/user/' + superUser._id + '/password')
                        .set('Content-Type', 'application/json')
                        .send({
                            userId: superUser._id,
                            password: superUserInfo.password,
                            newPassword: 'changepwdtest',
                            confirmPassword: 'changepwdtest'
                        })
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

        it('should without errors when forgot password', function (done) {
            agent.post('/app/auth/password/forgot')
                .set('Content-Type', 'application/json')
                .send({email: superUserInfo.email})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_EMAIL_SEND_OK');
                    done();
                });
        });

        it('should without errors when go to rest password page', function (done) {
            User.load({criteria: {email: superUserInfo.email}}, function (err, user) {
                if (err) {
                    return done(err);
                }
                resetPasswordToken = user.resetPasswordToken;
                agent.get('/app/auth/password/forgot/' + resetPasswordToken)
                    .set('Content-Type', 'application/json')
                    .expect('Content-Type', 'text/html; charset=utf-8')
                    .expect(200)
                    .end(function (err, res) {
                        done(err);
                    });
            });
        });

        it('should without errors when change password by token', function (done) {
            var passwordInfo = {
                token: resetPasswordToken,
                newPassword: 'testpassword',
                confirmPassword: 'testpassword'
            };
            agent.patch('/app/auth/password/forgot/change')
                .set('Content-Type', 'application/json')
                .send(passwordInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_NEW_PASSWORD_LOGIN');
                    done(err);
                });
        });
    });

});
