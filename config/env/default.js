'use strict';
var winston = require('winston'),
    path = require('path');

module.exports = {
    app: {
        version: '1.0.0',
        name: process.env.APP_NAME || 'commonServices',
        title: process.env.APP_TITLE || 'commonServices',
        description: process.env.APP_DESCRIPTION || 'commonServices',
        keywords: process.env.APP_KEYWORDS || 'commonServices',
        googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID
    },
    copyright: process.env.APP_TITLE || 'CommonService', // copyright for email templates
    fileSaveLocation: process.env.FILE_SAVE_LOCATION || 'local', //local,both,cloud
    qiniu: {
        ACCESS_KEY: process.env.QN_ACCESS_KEY,
        SECRET_KEY: process.env.QN_SECRET_KEY,
        bucket: process.env.QN_BUCKET,
        domainURL: process.env.QN_DOMAIN_URL
    },
    fileOptions: {
        /*Convert your chunk to byte*/
        maxFieldsSize: parseInt(process.env.FILE_MAX_SIZE) || 10 * 1024 * 1024 // 10MB,
    },
    port: process.env.PORT || 80,
    host: process.env.HOST || '0.0.0.0',
    db: {
        uri: process.env.DB_CONFIG_URI,
        options: {
            user: '',
            pass: ''
        },
        // Enable mongoose debug mode
        debug: process.env.MONGODB_DEBUG || false
    },
    templateEngine: 'swig',
    // Session Cookie settings
    sessionCookie: {
        // session expiration is set by default to 24 hours
        maxAge: 24 * (60 * 60 * 1000),
        // httpOnly flag makes sure the cookie is only accessed
        // through the HTTP protocol and not JS/browser
        httpOnly: true,
        // secure cookie should be turned to true to provide additional
        // layer of security so that the cookie is set only when working
        // in HTTPS mode.
        secure: false
    },
    // sessionSecret should be changed for security measures and concerns
    sessionSecret: process.env.SESSION_SECRET || 'MEAN',
    // sessionKey is set to the generic sessionId key used by PHP applications
    // for obsecurity reasons
    sessionKey: 'sessionId',
    sessionCollection: 'sessions',
    logger: {
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ]
    },
    // allow admin, superuser to access the routers as a role of user
    allowAdminAccessAPI: process.env.ALLOW_ADMIN_ACCESS_API,
    logo: './public/img/logo.png',
    favicon: './public/img/favicon.ico',
    mailGun: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAIL_DOMAIN,
        fromWho: process.env.MAIL_FROM_WHO
    },
    token: {
        userTokenLife: parseInt(process.env.USER_TOKEN_LIFE) || 5 * 60 * 1000, // 5 Minutes  5 * 60 * 1000
        userRefreshTokenShortLife: parseInt(process.env.USER_REFRESH_TOKEN_SHORT_LIFE) || 24 * 60 * 60 * 1000, // 24 hours 24*60*60*1000
        userRefreshTokenLongLife: parseInt(process.env.USER_REFRESH_TOKEN_LONG_LIFE) || 10 * 24 * 60 * 60 * 1000 // ten days 10*24*60*60*1000
    },
    livereload: true
};
