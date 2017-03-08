(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var path = require('path'),
        mongoose = require('mongoose'),
        config = require(path.resolve('./config/config')),
        Record = mongoose.model('record'),
        responseHandler = require(path.resolve('./config/helper/responseHelper')),
        _ = require('lodash');
    
    
    /**
     * Create a record
     */
    exports.create = function (req, res) {
        var record = new Record(req.body);
        // record.recordID = record.generateID();
        
        record.save(function (err, newRecord) {
            if (err) {
                config.error('create record error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_CREATE_DATA_OK',
                    messageInfo: ['Record', newRecord.name]
                }));
            }
        });
    };
    
    /**
     * get record info by _id
     */
    exports.read = function (req, res) {
        return res.send(responseHandler.getSuccessData(req.model));
    };
    
    /**
     * Update a record
     */
    exports.update = function (req, res) {
        var record = req.model;
        
        // do modify
        _.extend(record, req.body);
        
        record.save(function (err) {
            if (err) {
                config.error('update record error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_UPDATE_DATA_OK',
                    messageInfo: ['Record', record.name]
                }));
            }
        });
    };
    
    /**
     * Delete a record
     */
    exports.delete = function (req, res) {
        var record = req.model;
        record.remove(function (err, result) {
            if (err) {
                config.error('Error when remove record in db, err is ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_DELETE_DATA_OK',
                    messageInfo: ['Record', '-1']
                }));
            }
        });
    };
    
    /**
     * List of record
     */
    exports.list = function (req, res) {
        var options = {
            searchText: req.query.searchText || '',
            criteria: {}
        };
        
        // if (options.searchText && (options.searchText.trim().length !== 0)) {
        //     var searchTextRegEx = new RegExp(escape(options.searchText.trim()), 'i');
        //     options.criteria.$or = [
        //         {
        //             "email": {
        //                 $regex: searchTextRegEx
        //             }
        //         },
        //         {
        //             "displayName": {
        //                 $regex: searchTextRegEx
        //             }
        //         }
        //     ]
        // }
        
        Record.count(options.criteria, function (err, count) {
            var totalCount = count;
            options.page = req.query.page;
            options.limit = req.query.limit;
            Record.recordPagination(options, function (err, records) {
                if (err) {
                    res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    res.header('x-total-items-count', totalCount);
                    res.send(responseHandler.getSuccessData(records));
                }
            });
        });
        
    };
    
    /**
     * Record middleware
     */
    exports.recordByID = function (req, res, next, id) {
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.send(responseHandler.getResponseData('400'));
        }
        
        Record.findById(id)
            .exec(function (err, record) {
                if (err) {
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else if (!record) {
                    return res.send(responseHandler.getResponseData('400'));
                }
                req.model = record;
                next();
            });
    };
    
}());
