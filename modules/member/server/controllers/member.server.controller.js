(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var path = require('path'),
        mongoose = require('mongoose'),
        config = require(path.resolve('./config/config')),
        Member = mongoose.model('member'),
        responseHandler = require(path.resolve('./config/helper/responseHelper')),
        _ = require('lodash');
    
    
    /**
     * Create a member
     */
    exports.create = function (req, res) {
        var member = new Member(req.body);
        // member.memberID = member.generateID();
        
        member.save(function (err, newMember) {
            if (err) {
                config.error('create member error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_CREATE_DATA_OK',
                    messageInfo: ['Member', newMember.name]
                }));
            }
        });
    };
    
    /**
     * get member info by _id
     */
    exports.read = function (req, res) {
        return res.send(responseHandler.getSuccessData(req.model));
    };
    
    /**
     * Update a member
     */
    exports.update = function (req, res) {
        var member = req.model;
        
        // do modify
        _.extend(member, req.body);
        
        member.save(function (err) {
            if (err) {
                config.error('update member error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_UPDATE_DATA_OK',
                    messageInfo: ['Member', member.name]
                }));
            }
        });
    };
    
    /**
     * Delete a member
     */
    exports.delete = function (req, res) {
        var member = req.model;
        member.remove(function (err, result) {
            if (err) {
                config.error('Error when remove member in db, err is ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_DELETE_DATA_OK',
                    messageInfo: ['Member', '-1']
                }));
            }
        });
    };
    
    /**
     * List of member
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
        
        Member.count(options.criteria, function (err, count) {
            var totalCount = count;
            options.page = req.query.page;
            options.limit = req.query.limit;
            Member.memberPagination(options, function (err, members) {
                if (err) {
                    res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    res.header('x-total-items-count', totalCount);
                    res.send(responseHandler.getSuccessData(members));
                }
            });
        });
        
    };
    
    /**
     * Member middleware
     */
    exports.memberByID = function (req, res, next, id) {
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.send(responseHandler.getResponseData('400'));
        }
        
        Member.findById(id)
            .exec(function (err, member) {
                if (err) {
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else if (!member) {
                    return res.send(responseHandler.getResponseData('400'));
                }
                req.model = member;
                next();
            });
    };
    
}());
