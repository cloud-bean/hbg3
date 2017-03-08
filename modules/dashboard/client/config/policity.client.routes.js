(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.policy', {
                url: 'dashboard/policy',
                templateUrl: 'modules/dashboard/client/views/policy.client.view.html',
                controller: 'PolicyController',
                data: {
                    pageTitle: 'Dashboard-Policy',
                    roles: ['superuser', 'admin']
                }
            });
    }
}());
