'use strict';

var files = require('../controllers/files.server.controller');

module.exports = function(app) {
    app.route('/app/tool/files')
        .get(files.list)
        .post(files.upload);

    // Single email routes
    app.route('/app/tool/files/:fileId')
        .get(files.read)
        .delete(files.delete);

    app.post('/app/tool/files/:location', files.upload);

};
