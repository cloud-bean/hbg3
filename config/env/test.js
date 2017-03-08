'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
    db: {
        uri: process.env.TEST_DB_CONFIG || 'mongodb://user:123gogogo@120.27.52.242:27758/common_service-test',
        options: {
            user: '',
            pass: ''
        },
        // Enable mongoose debug mode
        debug: process.env.MONGODB_DEBUG || false
    },
    log: {
        // logging with Morgan - https://github.com/expressjs/morgan
        // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
        format: process.env.LOG_FORMAT || 'combined',
        options: {
            // Stream defaults to process.stdout
            // Uncomment/comment to toggle the logging to a log on the file system
            stream: {
                directoryPath: process.cwd(),
                fileName: 'access.log',
                rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
                    active: false, // activate to use rotating logs
                    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
                    frequency: 'daily',
                    verbose: false
                }
            }
        }
    },
    port: process.env.PORT || 3001,
    app: {
        title: defaultEnvConfig.app.title + ' - Test Environment'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    },
    // This config is set to true during grunt coverage
    coverage: process.env.COVERAGE || false,
    livereload: false
};
