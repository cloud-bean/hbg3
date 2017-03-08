(function () {
    'use strict';
    var path = require('path'),
        authHelper = require(path.resolve('./config/helper/auth'));
    
    var memberCtrl = require('../controllers/member.server.controller');
    
    
    module.exports = function (app) {
        
        app.route('/app/members')
            .all(authHelper.isAllowed)
            .get(memberCtrl.list)
            .post(memberCtrl.create);
        
        app.route('/app/members/:memberId')
            .all(authHelper.isAllowed)
            .get(memberCtrl.read)
            .put(memberCtrl.update)
            .delete(memberCtrl.delete);
        
        app.param('memberId', memberCtrl.memberByID);
    };
    
    
}());
