'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    config = require(path.resolve('./config/config')),
    EmailTemplate = mongoose.model('emailTemplate'),
    responseHandler = require(path.resolve('./config/helper/responseHelper')),
    htmlToText = require('html-to-text'),
    mailer = require(path.resolve('./config/helper/mailHelper')),
    swig = require('swig');


/**
 * Create an email
 */
exports.create = function (req, res) {
    var emailTemplate = new EmailTemplate(req.body);

    emailTemplate.save(function (err, newTemplate) {
        if (err) {
            config.error('create email template error: ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_CREATE_DATA_OK',
                messageInfo: ['Template', newTemplate.name]
            }));
        }
    });
};

/**
 * get email info by _id
 */
exports.read = function (req, res) { //todo
    return res.send(responseHandler.getSuccessData(req.emailTemplate));
};

/**
 * Update an Email
 */
exports.update = function (req, res) {
    var emailTemplate = req.emailTemplate;
    emailTemplate.title = req.body.title;
    emailTemplate.target = req.body.target;
    emailTemplate.subject = req.body.subject;
    emailTemplate.body = req.body.body;
    emailTemplate.textBody = htmlToText.fromString(emailTemplate.body);
    emailTemplate.save(function (err) {
        if (err) {
            config.error('update email template error: ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            //todo templateHandler.reRenderEmailTemplate
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_UPDATE_DATA_OK',
                messageInfo: ['Template', emailTemplate.name]
            }));
        }
    });
};

/**
 * Delete an Email
 */
exports.delete = function (req, res) {
    var emailTemplate = req.emailTemplate;
    emailTemplate.remove(function (err, result) {
        if (err) {
            config.error('Error when remove email template in db, err is ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_DELETE_DATA_OK',
                messageInfo: ['Template', '-1']
            }));
        }
    });
};

/**
 * List of Email
 */
exports.list = function (req, res) {
    EmailTemplate.find()
    .sort('-createTime')
    .exec(function (err, emailTemplates) {
        if (err) {
            config.error('err in get emailTemplates from db, err is ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getSuccessData(emailTemplates));
        }
    });
};


/*
 * Send Email for test email template
 * */
exports.send = function (req, res, next) {
    var sendInfo = req.body;
    mailer.sendTemplate(sendInfo.target, sendInfo.mailTitle, sendInfo);
    return res.send(responseHandler.getResponseData('CMSV_EMAIL_SEND_OK'));
};

/**
 * Email middleware
 */
exports.emailByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.send(responseHandler.getResponseData('400'));
    }

    EmailTemplate.findById(id)
    .exec(function (err, emailTemplate) {
        if (err) {
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else if (!emailTemplate) {
            return res.send(responseHandler.getResponseData('400'));
        }
        req.emailTemplate = emailTemplate;
        next();
    });
};
