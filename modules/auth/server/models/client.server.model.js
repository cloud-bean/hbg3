/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 08/02/2015.
 */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var ClientSchema = new Schema({
    clientName: {
        type: String,
        unique: 'client Name already exists',
        lowercase: true,
        trim: true,
        required: true
    },
    clientID: {
        type: String,
        unique: true,
        required: true
    },
    clientSecret: {
        type: String,
        required: true,
        default: crypto.randomBytes(32).toString('hex')
    },
    status: {
        type: Number
    }, // 1 active, -1 block
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

ClientSchema.path('clientName').validate(function(clientName) {
    return clientName.length && clientName.length < 100;
}, 'client name cannot be blank or too long');


module.exports = mongoose.model('client', ClientSchema, 'clients');
