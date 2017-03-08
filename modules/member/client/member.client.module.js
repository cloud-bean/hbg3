/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    (function (app) {
        'use strict';
        
        app.registerModule('member', ['flow', 'core']);
        app.registerModule('member.services');
        app.registerModule('member.routes', ['ui.router']);
        
    }(ApplicationConfiguration));
}());
