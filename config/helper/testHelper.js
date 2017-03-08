'use strict';

var should = require('should'),
    async = require('async');

/*
 * @params (expectObject, API return Data)
 * */
var compareObjectWithEachKeys = function (expectObject, responseObject, callback) {
    var keys = Object.keys(expectObject);
    async.map(keys, function (key, done) {
        responseObject[key].should.equal(expectObject[key]);
        done();
    }, function (err, results) {
        should.not.exist(err);
        callback && callback();
    });
};


/*
 * @params (DB Model, callback)
 * @cb(DB Data,Data Length)
 * */
var getItemsFromDBModel = function (options, Model, callback) {
    should.exist(Model.find);
    Model.find(options || {}, function (err, items) {
        should.not.exist(err);
        callback && callback(items || []);
    });
};

var getAllItemsFromDBModel = function (Model, callback) {
    return getItemsFromDBModel({}, Model, callback);
};

/*
 * @params(DB Model,Insert Data,Callback)
 * */
var saveItemsToDBModel = function (items, Model, callback) {
    should.exist(items);
    should.exist(Model);
    async.map(items, function (item, done) {
        var _Obj = new Model(item);
        _Obj.save(function (err, newObj) {
            should.not.exist(err);
            should.exist(newObj);
            compareObjectWithEachKeys(item, newObj);
            done();
        });
    }, function (err, results) {
        should.not.exist(err);
        should.exist(results);
        results.should.with.lengthOf(items.length);
        callback && callback();
    });
};

module.exports = {
    compareObjectWithEachKeys: compareObjectWithEachKeys,
    getItemsFromDBModel: getItemsFromDBModel,
    saveItemsToDBModel: saveItemsToDBModel,
    getAllItemsFromDBModel: getAllItemsFromDBModel
};
