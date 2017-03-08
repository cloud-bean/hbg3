'use strict';

var path = require('path'),
    winston = require('winston'),
    DailyRotateFile = require('winston-daily-rotate-file');
module.exports = {
    env: 'production',
    secure: {
        ssl: true,
        privateKey: './config/sslcerts/key.pem',
        certificate: './config/sslcerts/cert.pem'
    },
    port: process.env.PORT || 8443,
    db: {
        uri: process.env.DB_CONFIG_URI || 'mongodb://user:123gogogo@120.27.52.242:27758/common_service-demo',
        options: {
            user: '',
            pass: ''
        },
        // Enable mongoose debug mode
        debug: process.env.MONGODB_DEBUG || false
    },
    logger: {
        transports: [
            new winston.transports.Console({
                colorize: true
            }),
            new DailyRotateFile({
                level: 'silly',
                filename: path.join(__dirname, '../../logs/access-'),
                datePattern: 'yyyy-MM-dd.log',
                maxsize: 5242880 /* 5MB */
            })
        ]
    },
    livereload: false
};
