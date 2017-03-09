(function () {
    'use strict';
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var fileSchema = new Schema({
        fileName: String,
        URL: String,
        fileSize: String
    });

    var InventorySchema = new Schema({
        location: {
            type: String,     // 库存位置
            default: ''
        },
        store_name: {
            type: String,     // 商店名字
            default: ''
        },
        owner: {
            type: String,     // 拥有者
            default: ''
        },
        inv_code: {         // 入库编码
            type: String,

            require: true,

            unique: true,
            default: ''
        },
        in_time: {          // 入库时间
            type: Date,
            default: Date.now
        },
        isRent: {
            type: Boolean,    // 是否借出
            default: false
        },
        skuid: {            // 书商品编号(jd.com)
            type: String,
            default: ''
        },
        url: {              // 书网页地址（jd.com）
            type: String,
            default: ''
        },
        name: {             // 图书书名
            type: String,
            required: true
        },
        fm_radio_url: {             // fm音频地址
            type: String
        },
        isbn: String,       // 图书isbn
        img: String,        // 图书封面图片
        price: Number,      // wMaprice
        author: String,     // 图书作者
        pub_by: String,     // 出版社
        pub_date: Date,     // 出版时间
        pre_id: String,     // 原来mysql中的id
        tags: [{
            name: String
        }],      // 标签,
        file: fileSchema
    });

    /**
     * Hook a pre save method
     */
    InventorySchema.pre('save', function (next) {
        // code here

        next();
    });

    InventorySchema.methods = {
        // methodName: function () {}

    };

    InventorySchema.statics = {
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
        inventoryPagination: function (options, cb) {
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

    module.exports = mongoose.model('inventory', InventorySchema, 'inventories');

}());
