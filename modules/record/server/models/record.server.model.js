(function () {
    'use strict';
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var fileSchema = new Schema({
        fileName: String,
        URL: String,
        fileSize: String
    });

    var RecordSchema = new Schema({
        inventory: {
            type: Schema.ObjectId,
            ref: 'inventory',
            required: true
        },
        member: {
            type: Schema.ObjectId,
            ref: 'member',
            required: true
        },
        start_date: {
            type: Date,
            default: Date.now
        },
        status: String,    // R rent 借阅中， A ok 已经归还
        return_date: {
            type: Date,
            default: null
        }
    });

    /**
     * Hook a pre save method
     */
    RecordSchema.pre('save', function (next) {
        // code here

        next();
    });

    RecordSchema.methods = {
        // methodName: function () {}

    };

    RecordSchema.statics = {
        // staticPropertyName: value

        load: function (options, cb) {
            this.findOne(options.criteria)
                .select(options.select)
                .populate('inventory')
                .populate('member')
                .exec(cb);
        },
        loadAll: function (options, cb) {
            this.find(options.criteria)
                .select(options.select)
                .populate('inventory')
                .populate('member')
                .sort(options.sortBy || {
                    'created': -1
                })
                .exec(cb);
        },
        recordPagination: function (options, cb) {
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
                    .select(options.select)
                    .sort(options.sortBy || '-created')
                    .skip(skipFrom)
                    .limit(resultsPerPage)
                    .populate('inventory')
                    .populate('member');

            query.exec(function (error, results) {
                if (error) {
                    cb(error, null);
                } else {
                    cb(null, results);
                }
            });
        }
    };

    module.exports = mongoose.model('record', RecordSchema, 'records');

}());
