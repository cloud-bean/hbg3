'use strict';

var client = require('../controllers/client.server.controller'),
    path = require('path'),
    authHelper = require(path.resolve('./config/helper/auth'));

module.exports = function (app) {

    app.post('/app/auth/clients', authHelper.isAllowed, client.create);
    app.get('/app/auth/clients', authHelper.isAllowed, client.list);
    app.put('/app/auth/clients/:clientID', authHelper.isAllowed, client.update);
    app.delete('/app/auth/clients/:clientID', authHelper.isAllowed, client.delete);
};
