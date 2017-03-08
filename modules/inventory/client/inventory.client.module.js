/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    (function (app) {
        'use strict';
        
        app.registerModule('inventory', ['flow', 'core']);
        app.registerModule('inventory.services');
        app.registerModule('inventory.routes', ['ui.router']);
        
    }(ApplicationConfiguration));
}());
