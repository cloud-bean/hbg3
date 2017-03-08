(function () {
    'use strict';

    // Setting up route
    angular
    .module('auth.routes')
    .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        // Users state routing
        $stateProvider
        .state('authentication', {
            abstract: true,
            url: '/authentication',
            template: '<ui-view/>'
        })
        .state('authentication.signin', {
            url: '/login',
            controller: 'AuthenticationController',
            templateUrl: 'modules/auth/client/views/index.client.view.html',
            data: {
                pageTitle: 'Signin'
            }
        })
        .state('authentication.active', {
            url: '/active/:token',
            controller: 'ActiveByTokenController',
            templateUrl: 'modules/auth/client/views/active.client.view.html',
            data: {
                pageTitle: 'Active'
            }
        })
        .state('authentication.signout', {
            url: '/signout',
            controller: 'SignoutController',
            data: {
                ignoreState: true
            }
        });
    }
}());
