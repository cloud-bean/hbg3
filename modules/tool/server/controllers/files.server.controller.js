'use strict';

var formidable = require('formidable'),
    mongoose = require('mongoose'),
    File = mongoose.model('file'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    _ = require('lodash'),
    async = require('async'),
    fs = require('fs'),
    gm = require('gm').subClass({imageMagick: true}),
    responseHandler = require(path.resolve('./config/helper/responseHelper')),
    utilsHelper = require(path.resolve('./config/helper/utilsHelper')),
    url = require('url'),
    crypto = require('crypto');

var qiniu = require('qiniu');



exports.upload = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.encoding = 'utf-8';
    form.multiples = true;
    form.maxFieldsSize = config.fileOptions.maxFieldsSize;
    form.parse(req, function (err, fields, files) {
        if (err) {
            return next(err);
        }
        var fileType = files.file.type;
        var fileName = files.file.name;
        var uniqueName = crypto.randomBytes(10).toString('hex') + ((new Date()).getTime()) + path.extname(fileName);
        var fileInfo = {
            fileName: fileName,
            path: files.file.path,
            fileSize: utilsHelper.bytesToSize(files.file.size),
            uniqueName: uniqueName,
            createdBy: req.user ? req.user._id : ''.anchor(),
            localURL: '',
            cloudURL: '',
            URL: ''
        };
        
        var uploadFile = function (fileObj, done) {
            qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
            qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
    
            var bucket = config.qiniu.bucket;
            
            // remote file name
            var key = fileObj.uniqueName;
            
            // remote default domain
            var domainURL = config.qiniu.domainURL;
            // upload policy
            function uptoken(bucket, key) {
                var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
                return putPolicy.token();
            }
            
            // upload Token
            var token = uptoken(bucket, key);
            var extra = new qiniu.io.PutExtra();
            var localFile = fileObj.path;
            
            qiniu.io.putFile(token, key, localFile, extra, function (err, ret) {
                if (!err) {
                    // upload ok
                    if (ret.hash && ret.key) {
                        fileObj.cloudURL = domainURL + ret.key;
                    }
                    done(null, fileObj);
                } else {
                    // 上传失败， 处理返回代码
                    // console.log(err);
                    done(err);
                }
            });
        };
        
        var saveToDB = function (err, results) {
            if (err) {
                return res.send(responseHandler.getResponseData('500'));
            }
            
            if (results.cloudURL) {
                fileInfo.URL = results.cloudURL;
            } else {
                fileInfo.URL = results.localURL;
            }
            
            if (results.URL) {
                var file = new File(results);
                
                file.save(function (err) {
                    if (err) {
                        return res.send(responseHandler.getMongoErrorMessage(err));
                    } else {
                        return res.send(responseHandler.getSuccessData({
                            URL: file.URL,
                            fileName: file.fileName,
                            fileSize: file.fileSize
                        }));
                    }
                });
            } else {
                return res.send(responseHandler.getResponseData('500'));
            }
        };
    
        uploadFile(fileInfo, saveToDB);
    });
};

exports.list = function (req, res, next) {
    var options = {
        searchText: ''
    };
    
    File.count(function (err, count) {
        var totalCount = count;
        options.page = req.query.page;
        options.limit = req.query.limit;
        File.filePagination(options, function (err, files) {
            if (err) {
                res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                res.header('x-total-items-count', totalCount);
                res.send(responseHandler.getSuccessData(files));
            }
        });
    });
};

exports.read = function (req, res, next) {
    var fileId = req.params.fileId;
    if (!fileId) return res.send(responseHandler.getResponseData('400'));
    File.findOne({
        _id: fileId
    }, function (err, file) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        }
        if (!file) {
            return res.json(responseHandler.getResponseData({code: 'CMSV_NOT_FOUND_ERR', messageInfo: ['File']}));
        }
        return res.send(responseHandler.getSuccessData(file));
    });
};

exports.delete = function (req, res, next) {
    var fileId = req.params.fileId;
    if (!fileId) {
        return res.send(responseHandler.getResponseData('400'));
    }
    
    File.findOne({_id: fileId}, function (err, file) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        }
        if (!file) {
            return res.json(responseHandler.getResponseData({code: 'CMSV_NOT_FOUND_ERR', messageInfo: ['File']}));
        }
    
        var deleteFromCloud = function (done) {
            var client = new qiniu.rs.Client();
            var bucket = config.qiniu.bucket;
            client.remove(bucket, file.uniqueName, function (err, ret) {
                if (err) {
                    config.error('fail to rm file on cloud', file);
                }
            });
            done(null, file);
        };
        
        var deleteFromDB = function (file, done) {
            file.remove(done);
        };
    
        async.waterfall([
            deleteFromCloud,
            deleteFromDB
        ], function (err, result) {
            if (err) {
                return res.send(responseHandler.getResponseData('400'));
            }
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_DELETE_DATA_OK',
                messageInfo: ['File']
            }));
        });
    });
};
