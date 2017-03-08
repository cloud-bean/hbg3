/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    // Setting up angular routes
    angular
        .module('dashboard.routes')
        .config(routeConfig);
    
    routeConfig.$inject = ['$stateProvider'];
    
    function routeConfig($stateProvider) {
        $stateProvider
            .state('dashboard.member', {
                url: 'dashboard/member',
                templateUrl: 'modules/member/client/views/member.client.view.html',
                controller: 'MemberController',
                data: {
                    pageTitle: 'Dashboard-Inventories',
                    roles: ['admin', 'superuser']
                }
            });
    }
}());
