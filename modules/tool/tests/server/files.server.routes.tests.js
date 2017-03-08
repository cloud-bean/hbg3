'use strict';

var agent,
    should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    file = mongoose.model('file'),
    mockData = require(path.resolve('./mockData')),
    express = require(path.resolve('./config/lib/express')),
    fileInfo = {
        url: path.resolve('./modules/tool/tests/images/testImage.jpg')
    };

describe('app files test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginSuperuser(agent, done);
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('files operations by superUser', function () {
        it('should without errors when upload image', function (done) {
            agent.post('/app/tool/files')
                .attach('file', fileInfo.url)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.data.fileName, 'testImage.jpg');
                    fileInfo = res.body.data;
                    done();
                });
        });

        it('should without errors when get image list', function (done) {
            agent.get('/app/tool/files')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var files = res.body.data;
                    var existFile = files.some(function (file) {
                        if ((file.URL === fileInfo.URL) && file.fileName === fileInfo.fileName) {
                            fileInfo = file;
                            return true;
                        }
                        return false;
                    });
                    should.equal(existFile, true);
                    done();
                });
        });

        it('should without errors when get image', function (done) {
            agent.get('/app/tool/files/' + fileInfo._id)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.equal(res.body.data.localURL, fileInfo.localURL);
                    should.equal(res.body.data.cloudURL, fileInfo.cloudURL);
                    done();
                });
        });

        it('should without errors when delete image', function (done) {
            agent.delete('/app/tool/files/' + fileInfo._id)
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
