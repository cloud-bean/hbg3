(function () {
    'use strict';
    var path = require('path'),
        authHelper = require(path.resolve('./config/helper/auth'));
    
    var inventoryCtrl = require('../controllers/inventory.server.controller');
    
    
    module.exports = function (app) {
        
        app.route('/app/inventories')
            .all(authHelper.isAllowed)
            .get(inventoryCtrl.list)
            .post(inventoryCtrl.create);
        
        app.route('/app/inventories/:inventoryId')
            .all(authHelper.isAllowed)
            .get(inventoryCtrl.read)
            .put(inventoryCtrl.update)
            .delete(inventoryCtrl.delete);
        
        app.param('inventoryId', inventoryCtrl.inventoryByID);
    };
    
    
}());
