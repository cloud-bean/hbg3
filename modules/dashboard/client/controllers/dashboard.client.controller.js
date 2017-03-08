/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
    .module('dashboard')
    .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$rootScope','$scope', '$state', 'ConfigService', 'Authentication'];

    function DashboardController($rootScope,$scope, $state, ConfigService, Authentication) {
        $scope.init = function () {
            $scope.auth = Authentication.user;
            $scope.menus = [];
            $scope.verticalMenu = false;
            ConfigService.getConfig().then(function (result) {
                var configObj = result.data.option;
                $scope.fullScreen = configObj.fullScreen;
                var menus = ConfigService.sortMenu(configObj.menus);
                menus.forEach(function (menu) {
                    if ($scope.auth.roles.indexOf('superuser') > -1 ||
                        (($scope.auth.roles.indexOf('admin') > -1) &&
                        (menu.roles.indexOf('admin') > -1))) {
                        $scope.menus.push(menu);
                        if (!menu.topBar) {
                            $scope.verticalMenu = true;
                        }
                        if (menu.isDefault) {
                            $scope.defaultMenuState = menu.state;
                        }
                    }
                });
                $scope.defaultMenuState = $scope.defaultMenuState || $scope.menus[0].state;
                if ($state.current.name === 'dashboard') {
                    $scope.goDefault();
                }
            });
        };

        $rootScope.refreshConfig = $scope.init;

        $scope.goDefault = function () {
            $state.go($scope.defaultMenuState);
        };
    }
}());
