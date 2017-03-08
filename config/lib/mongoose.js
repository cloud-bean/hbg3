'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    chalk = require('chalk'),
    path = require('path'),
    mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function (callback) {
    // Globbing model files
    config.files.server.models.forEach(function (modelPath) {
        if (~modelPath.indexOf('.js')) require(path.resolve(modelPath));
    });

    if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (cb) {
    var _this = this;

    console.log(config.db.uri);
    var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
        // Log Error
        if (err) {
            config.error(chalk.red('Could not connect to MongoDB!'));
        } else {

            // Enabling mongoose debug mode if required
            //mongoose.set('debug', config.db.debug);

            // Call callback FN
            if (cb) cb(db);
        }
    });
};

module.exports.disconnect = function (cb) {
    mongoose.disconnect(function (err) {
        config.info(chalk.yellow('Disconnected from MongoDB.'));
        cb(err);
    });
};
