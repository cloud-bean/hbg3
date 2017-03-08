'use strict';

var defaultEnvConfig = require('./default'),
    path = require('path'),
    winston = require('winston'),
    DailyRotateFile = require('winston-daily-rotate-file');


module.exports = {
    env: 'development',
    port: process.env.PORT || 7000,
    app: {
        title: defaultEnvConfig.app.title + ' - Development Environment'
    },
    logger: {
        transports: [
            new winston.transports.Console({
                colorize: true
            }),
            new DailyRotateFile({
                level: 'silly',
                filename: path.resolve('./logs/access-'),
                datePattern: 'yyyy-MM-dd.log',
                maxsize: 5242880 /* 5MB */
            })
        ]
    }
};
