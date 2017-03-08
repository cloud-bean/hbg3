'use strict';

var agent,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    Client = mongoose.model('client'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express'));
var clientInfo = {
    clientName: 'testClient',
    clientID: 'testClientID'
};

describe('app client test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginSuperuser(agent, done);
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('client curd by superUser', function () {
        it('should without errors when create client', function (done) {
            agent.post('/app/auth/clients')
                .set('Content-Type', 'application/json')
                .send(clientInfo)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.code, 'CMSV_CREATE_DATA_OK');
                    done();
                });
        });

        it('should without errors when get clients', function (done) {
            agent.get('/app/auth/clients')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var clients = res.body.data;
                    var existClient = clients.some(function (client) {
                        if (client.clientID === clientInfo.clientID) {
                            clientInfo = client;
                            return true;
                        }
                        return false;
                    });
                    should.equal(existClient, true);
                    done();
                });
        });

        it('should without errors when update clients', function (done) {
            agent.put('/app/auth/clients/' + clientInfo._id)
                .set('Content-Type', 'application/json')
                .send({
                    clientName: 'changeName',
                    clientID: 'changeName'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    Client.findById(clientInfo._id)
                        .exec(function (err, client) {
                            if (err) {
                                return done(err);
                            }
                            should.equal(client.clientID, clientInfo.clientID);
                            should.equal(client.clientName, clientInfo.clientName);
                            done();
                        });
                });
        });

        it('should without errors when delete client', function (done) {
            agent.delete('/app/auth/clients/' + clientInfo._id)
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
})
;
