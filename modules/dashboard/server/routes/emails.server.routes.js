/**
 * Created by dangjian on 4/11/2016.
 */

'use strict';

var emails = require('../controllers/email.server.controller');

module.exports = function (app) {
    app.route('/app/dashboard/emails')
        .get(emails.list)
        .post(emails.create);

    // Single email routes
    app.route('/app/dashboard/emails/:emailId')
        .get(emails.read)
        .put(emails.update)
        .delete(emails.delete);

    app.route('/app/dashboard/emails/test')
        .post(emails.send);

    app.param('emailId', emails.emailByID);
};
