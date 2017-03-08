/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    // Setting up angular routes
    angular
        .module('dashboard.routes')
        .config(routeConfig);
    
    routeConfig.$inject = ['$stateProvider'];
    
    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.record', {
                url: 'dashboard/record',
                templateUrl: 'modules/record/client/views/record.client.view.html',
                controller: 'RecordController',
                data: {
                    pageTitle: 'Dashboard-Inventories',
                    roles: ['admin', 'superuser']
                }
            });
    }
}());
