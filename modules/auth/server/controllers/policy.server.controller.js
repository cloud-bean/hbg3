/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 06/03/2015.
 */

'use strict';
var path = require('path');
var config = require(path.resolve('./config/config'));
var mongoose = require('mongoose');
var Policy = mongoose.model('policy');
var mailer = require(path.resolve('./config/helper/mailHelper'));
var async = require('async');
var crypto = require('crypto');
var responseHandler = require(path.resolve('./config/helper/responseHelper'));
var acl = require('acl'),
    passport = require('passport');
acl = new acl(new acl.memoryBackend());

var policyIsAllow = function (req, res, next) {

    var user = req.user;
    var roles = (user && user.roles) ? user.roles : ['guest'];

    acl.areAnyRolesAllowed(roles, req.body.path, req.body.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.send(responseHandler.getResponseData('500'));
        } else {
            return res.send({isAllowed: isAllowed});
        }
    });
};

exports.getPolicy = function (req, res, next) {
    var policyName = req.body.policyName;
    Policy.findOne({policyName: policyName}, function (err, policy) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        }
        if (!policy) {
            return res.send({isAllowed: true});
        } else {
            var allowsObject = JSON.parse(policy.options);
            acl.allow([allowsObject], function (err) {
                if (err) {
                    return res.send(responseHandler.getResponseData('500'));
                }
                policyIsAllow(req, res, next);
            });
        }
    });
};

// policyName

exports.create = function (req, res, next) {
    var policy = new Policy(req.body);
    if (policy.options) {
        try {
            JSON.parse(policy.options);
        } catch (e) {
            return res.send(responseHandler.getResponseData('CMSV_INVALID_PARAM'));
        }
    }
    policy.save(function (err, newPolicy) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_CREATE_DATA_OK',
                messageInfo: ['Policy', newPolicy.policyName]
            }));
        }
    });
};

exports.delete = function (req, res, next) {
    var policyID = req.params.policyID;
    Policy.remove({
        _id: policyID
    }, function (err, result) {
        if (err) {
            config.error('remove policy error');
            return res.send(responseHandler.getResponseData());
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_DELETE_DATA_OK',
                messageInfo: ['policy', '-1']
            }));
        }
    });
};

exports.list = function (req, res, next) {
    Policy.find({}, function (err, policys) {
        if (err) {
            return res.send(responseHandler.getResponseData('400'));
        } else {
            return res.send(responseHandler.getSuccessData(policys));
        }
    });
};

exports.update = function (req, res, next) {
    var policyID = {_id: req.params.policyID},
        updateInfo = {
            policyName: req.body.policyName,
            options: req.body.options
        };

    Policy.update(policyID, updateInfo, function (err, newPolicy) {
        if (err) {
            config.error('update policy error');
            return res.send(responseHandler.getResponseData());
        } else {
            return res.send(responseHandler.getResponseData('200'));
        }
    });
};
