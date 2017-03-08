/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 08/02/2015.
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var PolicySchema = new Schema({
    policyName: {
        type: String,
        unique: 'policy Name already exists',
        lowercase: true,
        trim: true,
        required: true
    },
    options: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('policy', PolicySchema, 'policys');
