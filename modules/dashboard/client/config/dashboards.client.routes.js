(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        // Users state routing
        $stateProvider
            .state('dashboard', {
                url: '/',
                templateUrl: 'modules/dashboard/client/views/index.client.view.html',
                controller: 'DashboardController',
                data: {
                    pageTitle: 'Dashboard',
                    roles: ['admin', 'superuser']
                }
            });
    }
}());
