(function () {
    'use strict';

    var express = require('express'),
        router = express.Router(),
        path = require('path'),
        responseHandler = require(path.resolve('./config/helper/responseHelper'));

    router.use(function (req, res, next) {
        req.isAPI = true;
        next();
    });

    // router.get('/messages', function(req, res) {
    //     return res.send(responseHandler.getAllMessages());
    // });

    //.post('/messages', function(req, res) {
    //    responseHandler.extendMessages(req.body);
    //    res.send(responseHandler.getAllMessages());
    //});
    module.exports = router;
}());
