'use strict';


var passport = require('passport'),
    path = require('path'),
    oauth2 = require('../controllers/oAuth2.server.controller');
//oauth2 = require(path.resolve('./config/lib/middlewares/oauth2.config')),
//auth = require(path.resolve('./config/lib/middlewares/Oauth-authentication.js'));

module.exports = function(app) {
    // app.get('/oauth/authorize', auth.requiresLogin, oauth2.authorization, oauth2.dialog);
    // app.post('/oauth/authorize/decision', auth.requiresLogin, oauth2.server.decision());

    //app.get('/oauth/authorize', oauth2.authorization, oauth2.dialog);
    //app.post('/oauth/authorize/decision', oauth2.server.decision());

    app.post('/oauth/token', oauth2.token);
    app.post('/oauth/external/token', oauth2.externalToken);
    //app.post('/oauth/revoke', oauth2.revoke);
};
