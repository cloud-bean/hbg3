'use strict';

var agent,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    EmailTemplate = mongoose.model('emailTemplate'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express')),
    emailInfo = {
        title: 'email curd test',
        name: 'test',
        subject: '[Server test] User Created Successfully',
        target: 'Test user',
        body: 'This email just for server test',
        textBody: 'email test'
    };

describe('app email test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginSuperuser(agent, done);
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('email curd by superUser', function () {
        it('should without errors when create email template', function (done) {
            agent.post('/app/dashboard/emails')
                .set('Content-Type', 'application/json')
                .send(emailInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_CREATE_DATA_OK');
                    done();
                });
        });

        it('should without errors when get email templates', function (done) {
            agent.get('/app/dashboard/emails')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var templates = res.body.data;
                    var existEmailTemplate = templates.some(function (item) {
                        if (item.title === emailInfo.title) {
                            emailInfo = item;
                            return true;
                        }
                        return false;
                    });
                    should.equal(existEmailTemplate, true);
                    done();
                });
        });
    });

    describe('get update delete email template', function () {
        it('should without errors when get email template', function (done) {
            agent.get('/app/dashboard/emails/' + emailInfo._id)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.data.title, emailInfo.title);
                    done();
                });
        });

        it('should without errors when update email template', function (done) {
            emailInfo.title = 'email-update-test';
            agent.put('/app/dashboard/emails/' + emailInfo._id)
                .set('Content-Type', 'application/json')
                .send(emailInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    EmailTemplate.findById(emailInfo._id).exec(function (err, template) {
                        if (err) {
                            return done(err);
                        }
                        should.equal(emailInfo.title, template.title);
                        done();
                    });
                });
        });

        it('should without errors when delete email template', function (done) {
            agent.delete('/app/dashboard/emails/' + emailInfo._id)
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
});
