/**
 * Copyright 2014 Erealm Info & Tech.
 *
 * Created by Ken on 2015-06-08.
 */

'use strict';


var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    config = require(path.resolve('./config/config')),
    EmailTemplate = require('mongoose').model('emailTemplate'),
    swig = require('swig');

function Template() {
    this.emailTemplates = [];
    this.PDFTemplates = [
        {title: 'invoice', name: 'invoice'},
        {title: 'receipt', name: 'receipt'}
    ];
}

Template.prototype.renderEmailTemplate = function (title, data, callback, force) {
    var template = null;
    var _self = this;

    this.emailTemplates.every(function (item) {
        if (title === item.title) {
            template = item;
            return false;
        }
        return true;
    });

    var shouldReRender = !template || !template.compliedBody || !template.compliedTextBody || !template.subject || force;
    if (shouldReRender) {
        template = {};
        EmailTemplate.findOne({title: {$regex: title, $options: '$i'}})
            .exec(function (err, emailTemplate) {
                if (err || !emailTemplate) {
                    return callback && callback('no email template found');
                }

                template.title = emailTemplate.title;
                template.body = emailTemplate.body;
                template.textBody = emailTemplate.textBody;
                template.subject = emailTemplate.subject;

                try {
                    template.compliedBody = swig.compile(emailTemplate.body);
                    template.compliedTextBody = swig.compile(emailTemplate.textBody);
                } catch (compileErr) {
                    return callback && callback('compileErr');
                }

                _self.emailTemplates.push(template); // save to cache

                if (data) {
                    callback && callback(null, {
                        subject: template.subject,
                        body: template.compliedBody(data),
                        textBody: template.compliedTextBody(data)
                    });
                } else {
                    callback && callback(null);
                }
            });
    } else {
        if (data) {
            callback && callback(null, {
                body: template.compliedBody(data),
                textBody: template.compliedTextBody(data),
                subject: template.subject
            });
        } else {
            callback && callback(null);
        }
    }
};

Template.prototype.reRenderEmailTemplate = function (title, callback) {
    this.renderEmailTemplate(title, null, callback, true);
};

Template.prototype.renderPDF = function (title, data, force) {
    var template = null;
    this.PDFTemplates.every(function (item) {
        if (title === item.title) {
            template = item;
            return false;
        }

        return true;
    });
    if (!template) return {};
    if (!template.source || force) {
        template.source = {};
        var bodyTemplate = fs.readFileSync(path.join(__dirname, title + '-pdf.html'), 'utf8');
        template.body = bodyTemplate;
        try {
            template.source = swig.compile(bodyTemplate);
        } catch (pdfTemplateCompileError) {
            config.error('pdfTemplateCompileError: ', pdfTemplateCompileError);
        }
    }

    if (data) {
        return {body: template.source(data)};
    } else {
        return true;
    }
};

module.exports = new Template();
