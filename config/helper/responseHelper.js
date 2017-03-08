'use strict';
var _ = require('lodash'),
    path = require('path'),
    config = require(path.resolve('./config/config'));

var messages = {
    // system error message.
    '200': {message: 'The operation succeeds.', type: 'success', alert: true},
    '400': {message: 'Invalid request', type: 'error', alert: true},
    '401': {message: 'Sorry, you have no permission to access this page.', type: 'warning', action: 'OK'},
    '403': {message: 'User is not authorized', type: 'warning', alert: true},
    '404': {message: 'The request resource cannot be found.', type: 'error', alert: true},
    '500': {
        message: 'The server is temporarily unavailable. Please try again later.',
        type: 'error',
        alert: true
    },
    '600': {message: 'Session timed out, please login again.', type: 'error', action: 'OK'},

    'CMSV_INVALID_PARAM': 'Invalid input.',
    'CMSV_EMAIL_SEND_OK': {
        message: 'Email notification is sent. Please follow the steps in the email.',
        type: 'success'
    },
    'CMSV_SHOW_MESSAGE': '{0}.',
    'CMSV_SHOW_SUCCESS_MESSAGE': {message: '{0}.', type: 'success'},
    'CMSV_SUCCESS': {message: '{0}.', type: 'success'},
    'CMSV_ACCOUNT_ACTIVE_OK': {message: '{0} has been activated.', type: 'success'},
    'CMSV_ACTIVE_TOKEN_INVALID': '',
    'CMSV_ACCOUNT_BLOCK_OK': {message: '{0} has been blocked.', type: 'success'},
    'CMSV_CREATE_DATA_OK': {message: '{0} `{1}` has been added. {2}', type: 'success'},
    'CMSV_UPDATE_DATA_OK': {message: '{0} `{1}` has been updated.', type: 'success'},
    'CMSV_DELETE_DATA_OK': {message: '{0} has been deleted.', type: 'success'},
    'CMSV_NOT_FOUND_ERR': {
        message: '{0} is not found.',
        action: 'OK',
        type: 'error'
    },
    'CMSV_DUPLICATE_ERR': {
        message: 'The {0} has been used.',
        type: 'error'
    },
    // user management.
    'CMSV_PASSWORD_ERR': 'The password is incorrect.',
    'CMSV_INACTIVE_USER': 'The current state of the user is inactive.',
    'CMSV_OLD_PASSWORD_ERR': 'The old password is incorrect.',
    'CMSV_NEW_PASSWORD_ERR': 'The new password and confirming password do not match.',
    'CMSV_NEW_PASSWORD_LOGIN': {
        message: 'Password {0} successfully, please use new password to login.',
        type: 'success',
        action: 'login'
    },
    'CMSV_INVALID_TOKEN_ERR': '', // Invalid Token
    'CMSV_EXPIRED_TOKEN_ERR': '', // Expired Token
    'CMSV_INVALID_REFRESH_TOKEN_ERR': '', // Invalid Refresh Token
    'CMSV_EXPIRED_REFRESH_TOKEN_ERR': '', // Expired Refresh Token
    'CMSV_PASSWORD_RESET_ERR': 'Password reset token is invalid or has expired.',
    'CMSV_EMAIL_TPL_ERR': {
        message: 'Template {0} is wrong in format. Please check the variables expression',
        type: 'warning'
    },
    'CMSV_WAS_PAID': {
        message: 'Already paid',
        type: 'warning'
    }
};

var format = function (string, object) {
    if (typeof string !== 'string' || !object) return string;
    return string.replace(/{([^{}]*)}/g,
        function (match, group_match) {
            var data = object[group_match];
            return typeof data === 'string' ? data : '';
        }
    );
};


var formatMongoErrorMessage = function (err) {
    var output;

    try {
        var begin = 0;
        if (err.errmsg.lastIndexOf('.$') !== -1) {
            // support mongodb <= 3.0 (default: MMapv1 engine)
            // "errmsg" : "E11000 duplicate key error index: mean-dev.users.$email_1 dup key: { : \"test@user.com\" }"
            begin = err.errmsg.lastIndexOf('.$') + 2;
        } else {
            // support mongodb >= 3.2 (default: WiredTiger engine)
            // "errmsg" : "E11000 duplicate key error collection: mean-dev.users index: email_1 dup key: { : \"test@user.com\" }"
            begin = err.errmsg.lastIndexOf('index: ') + 7;
        }
        var fieldName = err.errmsg.substring(begin, err.errmsg.lastIndexOf('_1'));
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

    } catch (ex) {
        output = 'Unique field already exists';
    }

    return output;
};

exports.extendMessages = function (messageInfo) {
    _.extend(messages, messageInfo);
};

exports.getAllMessages = function () {
    return messages;
};

/**
 * Get the error message from error object
 */
exports.getMongoErrorMessage = function (err) {
    config.error('Mongoose error:' + err);
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = formatMongoErrorMessage(err);
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message;
            }
        }
    }

    return {code: 'CMSV_MONGOOSE_ERROR', message: message, type: 'error'};
};

/**
 * Get the formatted response data
 *
 * @params: responsInfo [string or object #{code: 'xxx', data: {}, messageInfo: [...]}# ]
 * @returns  { code: responsInfo.code,
 *    message: format(messages[code].message, responsInfo.messageInfo),
 *    data: responsInfo.data
 *    type: messages[responsInfo.code].type || 'error',
 *    action: messages[code].action || 'OK'
 *  }
 */
exports.getResponseData = function (responsInfo) {
    if (!responsInfo) responsInfo = {code: '500'};
    if (typeof (responsInfo) === 'string') {
        responsInfo = {code: responsInfo};
    }

    var mainMessage,
        messageObject = {},
        code = responsInfo.code,
        messageInfo = responsInfo.messageInfo;

    if (messages.hasOwnProperty(code)) {
        mainMessage = messages[code];
    } else {
        mainMessage = messages['500'];
    }
    messageObject.code = code;
    messageObject.data = responsInfo.data;
    messageObject.message = format(mainMessage.message || mainMessage, messageInfo);
    messageObject.type = mainMessage.type || 'error';
    messageObject.action = mainMessage.action || 'OK';
    messageObject.alert = mainMessage.alert;

    return messageObject;
};

/***
 * Get the success Object
 * @param data
 * @returns {code: 'success', data: {...}}
 */
exports.getSuccessData = function (data) {
    return {code: 'success', data: data};
};
