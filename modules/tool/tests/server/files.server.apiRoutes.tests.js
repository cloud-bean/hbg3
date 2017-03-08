'use strict';

var agent,
    loginInfo,
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

var testHelper = require(path.resolve('./config/helper/testHelper'));

describe('app files test', function () {
    before(function (done) {
        var app = express.init(mongoose);
        agent = request.agent(app);
        mockData.loginUser(agent, done, function (login) {
            loginInfo = login;
            done();
        });
    });
    after(function (done) {
        mockData.logoutUser(agent, done);
    });

    describe('files create and read by superUser', function () {
        it('should no files', function (done) {
            testHelper.getAllItemsFromDBModel(file, function (files) {
                should.equal(files.length, 0);
                done();
            });
        });

        it('should without errors when upload image', function (done) {
            agent.post('/api/base/tool/files')
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
            agent.get('/api/base/tool/files')
                .set('Authorization', loginInfo.token_type + ' ' + loginInfo.access_token)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var files = res.body.data;
                    var existFile = files.some(function (file) {
                        if ((file.URL === fileInfo.URL) && (file.fileName === fileInfo.fileName)) {
                            fileInfo = file;
                            return true;
                        }
                        return false;
                    });
                    should.equal(existFile, true);
                    done();
                });
        });

    });

});
