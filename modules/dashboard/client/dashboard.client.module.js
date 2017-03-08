(function (app) {
    'use strict';


    app.registerModule('dashboard', ['textAngular', 'flow', 'core', 'as.sortable']);

    app.registerModule('dashboard.services', ['auth.services']);

    app.registerModule('dashboard.routes', ['ui.router', 'core.routes', 'dashboard.services']);

}(ApplicationConfiguration));
