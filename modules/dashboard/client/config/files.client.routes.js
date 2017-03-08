(function () {
    'use strict';

    // Setting up route
    angular
        .module('dashboard.routes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.files', {
                url: 'dashboard/files',
                templateUrl: 'modules/dashboard/client/views/files.client.view.html',
                controller: 'FilesController',
                data: {
                    pageTitle: 'Dashboard-Files',
                    roles: ['superuser', 'admin']
                }
            });
    }

}());
