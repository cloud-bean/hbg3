(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.password', {
                url: 'dashboard/password',
                templateUrl: 'modules/dashboard/client/views/change-password.client.view.html',
                controller: 'ChangePasswordController',
                data: {
                    pageTitle: 'Change Password'
                }
            });
    }

}());
