/**
 * Copyright 2014 Erealm Info & Tech.
 *
 * Created by ken on 06/08/2015.
 */

'use strict';

var fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    templates = require('./templates'),
    Mailgun = require('mailgun-js'),
    transport,
    mailGun;


function Mailer() {
    //transport = nodemailer.createTransport('SMTP', _.clone(config.mail.options) || {});
    mailGun = new Mailgun({apiKey: config.mailGun.api_key, domain: config.mailGun.domain});
}

var saveToMailQueue = function (mailOptions, callback) {
    if (!mailOptions || (mailOptions.mqID && mailOptions.mqID !== ''))
        return;
};

Mailer.prototype.saveToMailQueue = saveToMailQueue;

Mailer.prototype.sendTemplate = function (to, title, data, attachments) {

    templates.renderEmailTemplate(title, data, function (err, result) {
        if (!err && !!result) {
            var mailOptions = {
                subject: result.subject,
                to: to,
                from: config.mailGun.fromWho
            };

            if (data.formatType && data.formatType === 'text') {
                //mailOptions.text = result.textBody;
                mailOptions.text = result.textBody;

            } else { //default is 0 as html format
                mailOptions.html = result.body;
            }

            if (attachments) {
                mailOptions.attachments = attachments;
            }

            config.info('Mail: ', JSON.stringify(mailOptions));

            mailGun.messages().send(mailOptions, function (err, body) {
                // if fails, save to the mail queue.
                if (err || !body.id || body.message !== 'Queued. Thank you.') {
                    saveToMailQueue(mailOptions, function (err, newMail) {
                        config.info('email options invalid, Error:', err, ', mailOptions: ', JSON.stringify(mailOptions));
                    });
                }
            });
        } else {
            config.error('error in rendering template ' + title + ', ' + err);
            return;
        }
    });


};

//
//Mailer.prototype.sendTemplateSMTP = function(to, title, data, attachments) {
//    templates.renderEmailTemplate(title, data, function (err, result) {
//        if (!err && !!result) {
//            var mailOptions = {
//                subject: result.subject,
//                to: to,
//                from: config.mail.options.auth.user,
//                text: result,
//                html: result.body
//            };
//            config.info('Mail: ', JSON.stringify(result));
//
//            transport.sendMail(mailOptions, function(error, info){
//                if(error){
//                    return console.log("sendMail failed, error is "+error);
//                }
//                console.log('Message sent success: ' + info.response);
//            });
//        } else {
//            config.error('Template ' + title + ' error when rendering' + err );
//            return;
//        }
//    });
//
//
//};

//Mailer.prototype.send = function(mailOptions, callback) {
//    if (!(mailOptions && mailOptions.subject && mailOptions.html)) {
//        return;
//    }
//
//    var from = config.mail.fromaddress,
//        to = mailOptions.to;
//
//    config.info('Mail: ', JSON.stringify(mailOptions));
//
//    mailOptions = _.extend(mailOptions, {
//        from: from,
//        to: to,
//        generateTextFromHTML: true
//    });
//
//    try {
//        this.transport.sendMail(mailOptions, function(error, response) {
//            if (error) {
//                config.error(error);
//                saveToMailQueue(mailOptions);
//            }
//
//            callback && callback(error, response);
//        });
//    } catch (err) {
//        config.error(err);
//        saveToMailQueue(mailOptions);
//        callback && callback(err);
//    }
//};

module.exports = new Mailer();
