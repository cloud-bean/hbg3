(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.email', {
                url: 'dashboard/email',
                templateUrl: 'modules/dashboard/client/views/email.client.view.html',
                controller: 'EmailController',
                data: {
                    pageTitle: 'Dashboard-Email',
                    roles: ['superuser', 'admin']
                }
            });
    }

}());
