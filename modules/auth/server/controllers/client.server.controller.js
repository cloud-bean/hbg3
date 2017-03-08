/**

 **/

'use strict';

var path = require('path');
var config = require(path.resolve('./config/config'));
var mongoose = require('mongoose');
var Client = mongoose.model('client');
var responseHandler = require(path.resolve('./config/helper/responseHelper'));
var async = require('async');
var crypto = require('crypto');

exports.create = function (req, res, next) {
    var client = new Client(req.body);
    client.save(function (err, newClient) {
        if (err) {
            config.error('save client error');
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_CREATE_DATA_OK',
                messageInfo: ['Client', newClient.clientName]
            }));
        }
    });
};

exports.list = function (req, res, next) {
    Client.find().exec(function (err, clients) {
        if (err) {
            config.error('get client list error');
            return res.send(responseHandler.getResponseData());
        } else {
            return res.send(responseHandler.getSuccessData(clients));
        }
    });
};

exports.delete = function (req, res, next) {
    var clientID = req.params.clientID;
    Client.remove({
        _id: clientID
    }, function (err, result) {
        if (err) {
            config.error('remove client error');
            return res.send(responseHandler.getResponseData());
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_DELETE_DATA_OK',
                messageInfo: ['Client', '-1']
            }));
        }
    });
};

exports.update = function (req, res, next) {
    var newClientSecret = crypto.randomBytes(20).toString('hex');
    Client.update({
        clientID: req.body.clientID
    }, {
        clientSecret: newClientSecret
    }, function (err, result) {
        if (err) {
            config.error('update user error');
            return res.send(responseHandler.getResponseData());
        } else {
            return res.send(responseHandler.getResponseData('200'));
        }
    });
};
