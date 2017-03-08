(function () {
    'use strict';
    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);
    routeConfig.$inject = ['$stateProvider'];
    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.staff', {
                url: 'dashboard/staff',
                templateUrl: 'modules/dashboard/client/views/staff.client.view.html',
                controller: 'StaffController',
                data: {
                    pageTitle: 'Dashboard-Staff Admin',
                    roles: ['admin', 'superuser']
                }
            });
    }
}());
