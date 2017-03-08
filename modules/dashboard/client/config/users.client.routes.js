(function () {
    'use strict';
    // Setting up route
    angular
    .module('dashboard.routes')
    .config(routeConfig);
    routeConfig.$inject = ['$stateProvider'];
    function routeConfig($stateProvider) {
        $stateProvider
        .state('dashboard.user', {
            url: 'dashboard/user',
            templateUrl: 'modules/dashboard/client/views/users.client.view.html',
            controller: 'UsersController',
            data: {
                pageTitle: 'Dashboard-Users Users',
                roles: ['admin', 'superuser']
            }
        });
    }
}());
