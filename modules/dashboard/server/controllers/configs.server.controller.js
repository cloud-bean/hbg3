'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    serverConfig = require(path.resolve('./config/config')),
    Config = mongoose.model('config'),
    responseHandler = require(path.resolve('./config/helper/responseHelper'));

/**
 * Update an config
 */
exports.update = function (req, res) {
    var configOption = req.body.option;
    Config.update({}, {$set: {option: configOption}}, function (err) {
        if (err) {
            serverConfig.error('update config error: ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else {
            return res.send(responseHandler.getResponseData({
                code: 'CMSV_SHOW_SUCCESS_MESSAGE',
                messageInfo: ['Config has been updated']
            }));
        }
    });
};
/**
 * read config by name
 */
exports.read = function (req, res, next) {
    Config.load({}, function (err, oldConfig) {
        if (err) {
            serverConfig.error('get config error: ' + err);
            return res.send(responseHandler.getMongoErrorMessage(err));
        } else if (!oldConfig) {
            var configInfo = {
                option: {
                    menus: [{
                        'isDefault': true,
                        'state': 'dashboard.config',
                        'name': 'Config',
                        'mobile': false,
                        'roles': ['superuser'],
                        'isSeed': true,
                        'order': 0
                    }],
                    fullScreen: false
                }
            };
            var config = new Config(configInfo);
            config.save(function (err, newConfig) {
                if (err) {
                    serverConfig.error('create config error: ' + err);
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    return res.send(responseHandler.getSuccessData(newConfig));
                }
            });
        } else {
            return res.send(responseHandler.getSuccessData(oldConfig));
        }
    });
};
