'use strict';

var configs = require('../controllers/configs.server.controller');

module.exports = function (app) {
    app.route('/app/dashboard/config')
    .get(configs.read)
    .put(configs.update);

};
