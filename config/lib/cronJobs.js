(function () {
    'use strict';

    var path = require('path'),
        config = require(path.resolve('./config/config'));

    var start = function () {
        config.files.server.cronJobs.forEach(function (jobPath) {
            if (~jobPath.indexOf('.js')) require(path.resolve(jobPath));
        });
    };
    module.exports = {
        start: start
    };
}());
