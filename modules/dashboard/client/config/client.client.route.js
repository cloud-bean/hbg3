(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.client', {
                url: 'dashboard/client',
                templateUrl: 'modules/dashboard/client/views/client.client.view.html',
                controller: 'ClientController',
                data: {
                    pageTitle: 'Dashboard-Client',
                    roles: ['superuser', 'admin']
                }
            });
    }

}());
