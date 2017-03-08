(function () {
    'use strict';

    // Setting up route
    angular
    .module('dashboard.routes')
    .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
        .state('dashboard.config', {
            url: 'dashboard/config',
            templateUrl: 'modules/dashboard/client/views/config.client.view.html',
            controller: 'ConfigController',
            data: {
                pageTitle: 'Dashboard-Config',
                roles: ['superuser']
            }
        });
    }

}());
