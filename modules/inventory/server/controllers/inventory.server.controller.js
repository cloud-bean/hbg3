(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var path = require('path'),
        mongoose = require('mongoose'),
        config = require(path.resolve('./config/config')),
        Inventory = mongoose.model('inventory'),
        responseHandler = require(path.resolve('./config/helper/responseHelper')),
        _ = require('lodash');

    /**
     * Create a inventory
     */
    exports.create = function (req, res) {
        var inventory = new Inventory(req.body);
        // inventory.inventoryID = inventory.generateID();
        inventory.save(function (err, newInventory) {
            if (err) {
                config.error('create inventory error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_CREATE_DATA_OK',
                    messageInfo: ['Inventory', newInventory.name]
                }));
            }
        });
    };

    /**
     * get inventory info by _id
     */
    exports.read = function (req, res) {
        return res.send(responseHandler.getSuccessData(req.model));
    };

    /**
     * Update a inventory
     */
    exports.update = function (req, res) {
        var inventory = req.model;

        // do modify
        _.extend(inventory, req.body);

        inventory.save(function (err) {
            if (err) {
                config.error('update inventory error: ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_UPDATE_DATA_OK',
                    messageInfo: ['Inventory', inventory.name]
                }));
            }
        });
    };

    /**
     * Delete a inventory
     */
    exports.delete = function (req, res) {
        var inventory = req.model;
        inventory.remove(function (err, result) {
            if (err) {
                config.error('Error when remove inventory in db, err is ' + err);
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({
                    code: 'CMSV_DELETE_DATA_OK',
                    messageInfo: ['Inventory', '-1']
                }));
            }
        });
    };

    /**
     * List of inventory
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

        Inventory.count(options.criteria, function (err, count) {
            var totalCount = count;
            options.page = req.query.page;
            options.limit = req.query.limit;
            Inventory.inventoryPagination(options, function (err, inventories) {
                if (err) {
                    res.send(responseHandler.getMongoErrorMessage(err));
                } else {
                    res.header('x-total-items-count', totalCount);
                    res.send(responseHandler.getSuccessData(inventories));
                }
            });
        });

    };

    /**
     * Inventory middleware
     */
    exports.inventoryByID = function (req, res, next, id) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.send(responseHandler.getResponseData('400'));
        }

        Inventory.findById(id)
            .exec(function (err, inventory) {
                if (err) {
                    return res.send(responseHandler.getMongoErrorMessage(err));
                } else if (!inventory) {
                    return res.send(responseHandler.getResponseData('400'));
                }
                req.model = inventory;
                next();
            });
    };

}());
