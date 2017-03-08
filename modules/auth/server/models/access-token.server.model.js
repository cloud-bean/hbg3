/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 08/02/2015.
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// AccessToken
var AccessTokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'user'
    },
    client: {
        type: Schema.ObjectId,
        ref: 'client'
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

module.exports = mongoose.model('accessToken', AccessTokenSchema, 'accessTokens');
