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
            .state('dashboard.inventory', {
                url: 'dashboard/inventory',
                templateUrl: 'modules/inventory/client/views/inventory.client.view.html',
                controller: 'InventoryController',
                data: {
                    pageTitle: 'Dashboard-Inventories',
                    roles: ['admin', 'superuser']
                }
            });
    }
}());
