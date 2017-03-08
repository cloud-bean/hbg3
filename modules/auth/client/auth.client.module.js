(function (app) {
    'use strict';

    app.registerModule('auth');
    app.registerModule('auth.routes', ['ui.router', 'core.routes']);
    app.registerModule('auth.services');
}(ApplicationConfiguration));
