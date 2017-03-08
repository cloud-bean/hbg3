/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 16/1/4
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var htmlToText = require('html-to-text');

var EmailTemplateSchema = new Schema({
    title: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    body: {
        type: String
    },
    textBody: {
        type: String
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    }
});

EmailTemplateSchema.pre('validate', function (next) {
    var currentTime = new Date();
    if (this.isNew) {
        this.createTime = currentTime;
        this.textBody = htmlToText.fromString(this.body || '');
    } else {
        this.updateTime = currentTime;
    }
    next();
});
//
//EmailTemplateSchema.statics = {
//    load: function (options, cb) {
//        this.findOne(options.criteria)
//            .exec(cb);
//    },
//
//    loadAll: function (options, cb) {
//        if (options.select) {
//            this.find(options.criteria)
//                .select(options.select)
//                .exec(cb);
//        } else {
//            this.find(options.criteria)
//                .exec(cb);
//        }
//    }
//};

module.exports = mongoose.model('emailTemplate', EmailTemplateSchema, 'emailTemplates');
