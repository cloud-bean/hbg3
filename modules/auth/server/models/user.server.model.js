/**
 * Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 06/03/2015.
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
    return (!this.updated || property.length);
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
    return (!this.updated || validator.isEmail(email, {
        require_tld: false
    }));
};

var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name']
    },
    displayName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
    },
    username: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        default: ''
    },
    salt: {
        type: String
    },
    profileImageURL: {
        type: String
    },
    provider: {
        type: String,
        default: 'local',
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin', 'superuser']
        }],
        default: ['user'],
        required: 'Please provide at least one role'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'secret'],
        default: 'secret'
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    middleName: {
        type: String,
        trim: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    }, /* -1: blocked, 0: first login, 1: common, 2: require confirm*/
    /* For user register require confirm*/
    activeToken: {
        type: String
    },
    changeReason: {
        type: String
    },
    option: {
        type: Object
    },
    firstBind: {
        type: Boolean
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    if (!this.username) {
        this.username = this.email;
    }
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

UserSchema.methods = {
    authenticate: function (plainPassword) {
        return this.password === this.hashPassword(plainPassword);
    },
    hashPassword: function (password) {
        if (this.salt && password) {
            return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
        } else {
            return password;
        }
    }
};

var ALPHA_CAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ALPHA = 'abcdefghijklmnopqrstuvwxyz',
    NUM = '0123456789',
    SPL_CHARS = '!@#$^*',
    noOfCAPSAlpha = 2,
    noOfDigits = 2,
    noOfSplChars = 1,
    minLen = 8,
    maxLen = 12;

var getRandomInt = function (min, max, data) {
    var result = Math.floor(Math.random() * (max - min + 1) + min);
    while (data && data[result]) {
        result = Math.floor(Math.random() * (max - min + 1) + min);
    }
    return result;
};

UserSchema.statics = {
    randomPassword: function () {
        if (process.env.NODE_ENV === 'e2e' || process.env.NODE_ENV === 'test') {
            return 'default';
        }
        var len = getRandomInt(minLen, maxLen);
        var pswd = [];
        var index = 0;
        var i = 0;

        for (i = 0; i < noOfCAPSAlpha; i++) {
            index = getRandomInt(0, len, pswd);
            pswd[index] = ALPHA_CAPS[getRandomInt(0, ALPHA_CAPS.length)];
        }

        for (i = 0; i < noOfDigits; i++) {
            index = getRandomInt(0, len, pswd);
            pswd[index] = NUM[getRandomInt(0, NUM.length)];
        }

        for (i = 0; i < noOfSplChars; i++) {
            index = getRandomInt(0, len, pswd);
            pswd[index] = SPL_CHARS[getRandomInt(0, SPL_CHARS.length)];
        }

        for (i = 0; i < len; i++) {
            if (!pswd[i]) {
                pswd[i] = ALPHA[getRandomInt(0, ALPHA.length)];
            }
        }

        return pswd.join('');
    },

    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    load: function (options, cb) {
        options.select = options.select || '-salt -password';
        this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
    },
    loadAll: function (options, cb) {
        options.select = options.select || '-salt -password';
        this.find(options.criteria)
        .select(options.select)
        .sort(options.sortBy || {
                'created': -1
            })
        .exec(cb);
    },
    userPagination: function (options, cb) {
        var MAX_LIMIT = 50; // set max limit for pagination.
        if (options.limit > MAX_LIMIT) {
            options.limit = MAX_LIMIT;
        }
        var q = options.criteria || {},
            col = options.columns || {},
            pageNumber = parseInt(options.page, 10) || 1,
            resultsPerPage = parseInt(options.limit, 10) || 20,
            skipFrom = (pageNumber * resultsPerPage) - resultsPerPage,
            query = this.find(q, col)
            .select(options.select || '-salt -password -activeToken')
            .sort(options.sortBy || '-created')
            .skip(skipFrom)
            .limit(resultsPerPage);

        query.exec(function (error, results) {
            if (error) {
                cb(error, null);
            } else {
                cb(null, results);
            }
        });
    }
};

module.exports = mongoose.model('user', UserSchema, 'users');
