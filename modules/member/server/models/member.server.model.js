(function () {
    'use strict';
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var fileSchema = new Schema({
        fileName: String,
        URL: String,
        fileSize: String
    });

    var MemberSchema = new Schema({
        pre_id: String, // 原来系统中的数据纪录的id
        phone_number: {
            type: String,
            required: true
        },
        baby_name: {
            type: String,
            required: true
        },
        baby_birthday: Date,
        isBoy: Boolean,  // sexual
        card_number: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        active_time: {
            type: Date,
            default: Date.now
        },
        valid_days: Number,
        level: {  	// 会员类型 0,1,2
            type: Number,
            enum: [0, 1, 2]
        },
        parent_name: String,
        address: String,
        email: {
            type: String,
            match: /.+\@.+\..+/
        },
        weixin: String,
        other: String,  // 备注
        max_book: {
            type: Number,
            default: 4
        },
        locked: {
            type: Boolean,
            default: false
        },
        file: fileSchema,
        head_photo: String // 头像
    });

    /**
     * Hook a pre save method
     */
    MemberSchema.pre('save', function (next) {
        // code here

        next();
    });

    MemberSchema.methods = {
        // methodName: function () {}

    };

    MemberSchema.statics = {
        // staticPropertyName: value

        load: function (options, cb) {
            this.findOne(options.criteria)
                .select(options.select)
                .exec(cb);
        },
        loadAll: function (options, cb) {
            this.find(options.criteria)
                .select(options.select)
                .sort(options.sortBy || {
                    'created': -1
                })
                .exec(cb);
        },
        memberPagination: function (options, cb) {
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

    module.exports = mongoose.model('member', MemberSchema, 'members');

}());
