/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 08/02/2015.
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// AccessToken
var RefreshTokenSchema = new Schema({
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
    rememberMe: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('refreshToken', RefreshTokenSchema, 'refreshTokens');
