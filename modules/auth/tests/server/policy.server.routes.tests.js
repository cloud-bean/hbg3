'use strict';

var agent,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    Policy = mongoose.model('policy'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express'));
var policyInfo = {
    policyName: 'testPolicy',
    options: '{}'
};

describe('app policy test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginSuperuser(agent, done);
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('policy curd by superUser', function () {
        it('should without errors when create policy', function (done) {
            agent.post('/app/auth/policys')
                .set('Content-Type', 'application/json')
                .send(policyInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_CREATE_DATA_OK');
                    done();
                });
        });

        it('should without errors when get policys', function (done) {
            agent.get('/app/auth/policys')
                .set('Content-Type', 'application/json')
                .send(policyInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var policys = res.body.data;
                    var existPolicy = policys.some(function (policy) {
                        if (policy.policyName === (policyInfo.policyName).toLowerCase()) {
                            policyInfo = policy;
                            return true;
                        }
                        return false;
                    });
                    should.equal(existPolicy, true);
                    done();
                });
        });

        it('should without errors when update policy info', function (done) {
            policyInfo.policyName = 'change policy name';
            agent.put('/app/auth/policys/' + policyInfo._id)
                .set('Content-Type', 'application/json')
                .send({
                    policyName: policyInfo.policyName
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    Policy.findById(policyInfo._id)
                        .exec(function (err, policy) {
                            if (err) {
                                return done(err);
                            }
                            should.equal(policy.policyName, policyInfo.policyName);
                            done();
                        });
                });
        });

        it('should without errors when delete policy', function (done) {
            agent.delete('/app/auth/policys/' + policyInfo._id)
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
