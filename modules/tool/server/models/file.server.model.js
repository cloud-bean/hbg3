'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
    return (!this.updated || property.length);
};

var FileSchema = new Schema({
    fileName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    createdBy: {
        type: String,
        trim: true,
        default: ''
    },
    client: {
        type: String,
        trim: true
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    uniqueName: {
        type: String,
        trim: true,
        require: true
    },
    localURL: {
        type: String,
        trim: true
    },
    URL: {
        type: String,
        trim: true
    },
    cloudURL: {
        type: String,
        trim: true
    },
    fileSize: {
        type: String,
        require: true
    },
    option: {
        type: Object
    },
    group: {
        type: String
    }
});


FileSchema.statics = {
    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    /* todo Delete load and loadAll?*/
    load: function (options, cb) {
        options.select = options.select;
        this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
    },
    loadAll: function (options, cb) {
        options.select = options.select;
        this.find(options.criteria)
        .select(options.select)
        .sort(options.sortBy || {
            'created': -1
        })
        .exec(cb);
    },
    filePagination: function (options, cb) {
        var MAX_LIMIT = 50; // set max limit for pagination.
        if (options.limit > MAX_LIMIT) {
            options.limit = MAX_LIMIT;
        }
        var q = options.criteria || {},
            col = options.columns || {},
            pageNumber = parseInt(options.page, 10) || 1,
            resultsPerPage = parseInt(options.limit, 10) || 20,
            skipFrom = (pageNumber * resultsPerPage) - resultsPerPage,
            query = this.find(q, col)
            .sort(options.sortBy || '-created')
            .skip(skipFrom)
            .limit(resultsPerPage);

        query.exec(function (error, results) {
            if (error) {
                cb(error, null);
            } else {
                cb(null, results);
            }
        });
    }
};

module.exports = mongoose.model('file', FileSchema, 'files');
