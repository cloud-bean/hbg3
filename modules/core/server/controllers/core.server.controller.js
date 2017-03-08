'use strict';

var validator = require('validator');
var path = require('path');
var responseHandler = require(path.resolve('./config/helper/responseHelper'));
/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
    var safeUserObject = null;
    if (req.user) {
        safeUserObject = {
            _id: req.user._id,
            displayName: validator.escape(req.user.displayName || ''),
            provider: validator.escape(req.user.provider || ''),
            created: req.user.created.toString(),
            roles: req.user.roles,
            profileImageURL: req.user.profileImageURL,
            email: validator.escape(req.user.email),
            lastName: validator.escape(req.user.lastName),
            firstName: validator.escape(req.user.firstName),
            additionalProvidersData: req.user.additionalProvidersData,
            providerData: req.user.providerData || {},
            option: req.user.option || {}
        };
    }

    res.render('modules/core/server/views/index', {
        user: safeUserObject
    });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
    res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
    });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {
    if (req.xhr || req.isAPI) {
        return res.send(responseHandler.getResponseData('404'));
    } else {
        return res.status(404).render('modules/core/server/views/404', {
            url: req.originalUrl,
            error: 'The request resource wasn\'t found.'
        });
    }
};
