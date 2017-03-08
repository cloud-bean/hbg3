(function () {
    'use strict';
    var path = require('path'),
        authHelper = require(path.resolve('./config/helper/auth'));
    
    var recordCtrl = require('../controllers/record.server.controller');
    
    
    module.exports = function (app) {
        
        app.route('/app/records')
            .all(authHelper.isAllowed)
            .get(recordCtrl.list)
            .post(recordCtrl.create);
        
        app.route('/app/records/:recordId')
            .all(authHelper.isAllowed)
            .get(recordCtrl.read)
            .put(recordCtrl.update)
            .delete(recordCtrl.delete);
        
        app.param('recordId', recordCtrl.recordByID);
    };
    
    
}());
