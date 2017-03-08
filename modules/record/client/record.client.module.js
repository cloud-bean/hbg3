/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    (function (app) {
        'use strict';
        
        app.registerModule('record', ['flow', 'core']);
        app.registerModule('record.services');
        app.registerModule('record.routes', ['ui.router']);
        
    }(ApplicationConfiguration));
}());
