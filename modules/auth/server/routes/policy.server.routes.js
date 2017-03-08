'use strict';


var passport = require('passport'),
    path = require('path'),
    authHelper = require(path.resolve('./config/helper/auth')),
    policy = require('../controllers/policy.server.controller');

module.exports = function (app) {
    app.get('/app/auth/policys', authHelper.isAllowed, policy.list);
    app.put('/app/auth/policys/:policyID', authHelper.isAllowed, policy.update);
    app.delete('/app/auth/policys/:policyID', authHelper.isAllowed, policy.delete);
    app.post('/app/auth/policys', authHelper.isAllowed, policy.create);
};
