/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
    .module('dashboard')
    .controller('ConfigController', ConfigController)
    .controller('MenuModalController', MenuModalController);

    ConfigController.$inject = ['$rootScope', '$scope', 'ConfigService', '$uibModal'];

    function ConfigController($rootScope, $scope, ConfigService, $modal) {
        var refresh = function () {
            ConfigService.getConfig().then(function (result) {
                $scope.configObj = result.data;
                $scope.menus = ConfigService.sortMenu($scope.configObj.option.menus);
                $scope.fullScreen = $scope.configObj.option.fullScreen;
            });
        };

        $scope.initConfig = refresh;

        var saveConfig = function (config) {
            ConfigService.saveConfig(config).then(function () {
                $rootScope.refreshConfig();
                refresh();
            });
        };

        var addMenu = function (menu) {
            menu.roles = ['superuser'];
            menu.order = $scope.configObj.option.menus.length;
            menu.topBar = false;
            $scope.configObj.option.menus.push(menu);
            saveConfig($scope.configObj);
        };

        var updateMenu = function (newMenuObj) {
            $scope.configObj.option.menus.some(function (menu) {
                if (menu.state === newMenuObj.state) {
                    menu = updateMenu;
                    return true;
                } else {
                    return false;
                }
            });
            saveConfig($scope.configObj);
        };

        var menuActions = {
            create: {
                templateURL: '/menu_form',
                controller: 'MenuModalController',
                windowClass: 'modal-common',
                backdrop: 'static',
                title: 'CREATE MENU',
                name: 'Create',
                action: addMenu
            },
            update: {
                templateURL: '/menu_form',
                controller: 'MenuModalController',
                windowClass: 'modal-common',
                backdrop: 'static',
                title: 'UPDATE MENU',
                name: 'Update',
                action: updateMenu
            }
        };

        var deleteMenu = function (menuObj) {
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['menu', menuObj.name], function () {
                $scope.configObj.option.menus = [];
                $scope.menus.forEach(function (menu) {
                    if (menu.state !== menuObj.state) {
                        $scope.configObj.option.menus.push(menu);
                    }
                });
                saveConfig($scope.configObj);
            });
        };

        var showMenuModal = function (currentAction, data) {
            var modalInstance = $modal.open({
                templateUrl: menuActions[currentAction].templateURL,
                controller: menuActions[currentAction].controller,
                windowClass: 'modal-common',
                backdrop: 'static',
                resolve: {
                    menu: data,
                    currentAction: menuActions[currentAction]
                }
            });
            modalInstance.result.then(function (menu) {
                menuActions[currentAction].action(menu);
            });
        };

        var operateMenuRoles = function (menu, role) {
            if (menu.roles.indexOf(role) > -1) {
                menu.roles.splice(menu.roles.indexOf(role));
            } else {
                menu.roles.push(role);
            }
            updateMenu(menu);
        };

        var changeDefaultMenu = function (currentMenu) {
            $scope.configObj.option.menus.forEach(function (menu) {
                menu.isDefault = menu.state === currentMenu.state;
            });
            saveConfig($scope.configObj);
        };

        var operateMenuVisible = function (menu) {
            menu.mobile = !menu.mobile;
            updateMenu(menu);
        };

        var changeMenuPosition = function (menu) {
            menu.topBar = !menu.topBar;
            updateMenu(menu);
        };

        var changeMenuOrder = function (event) {
            $scope.menus[event.dest.index].order = event.dest.index;
            $scope.menus[event.source.index].order = event.source.index;
            $scope.configObj.option.menus = $scope.menus;
            saveConfig($scope.configObj);
        };

        $scope.menuOperation = {
            deleteMenu: deleteMenu,
            showModal: showMenuModal,
            changeRoles: operateMenuRoles,
            changeDefault: changeDefaultMenu,
            changeVisible: operateMenuVisible,
            changeMenuPosition: changeMenuPosition
        };

        $scope.menusSortConfig = {
            handleClass: 'glyphicon-menu-hamburger',
            orderChanged: changeMenuOrder
        };

        var changeFullScreenMode = function () {
            $scope.configObj.option.fullScreen = !$scope.configObj.option.fullScreen;
            saveConfig($scope.configObj);
        };

        $scope.basicOperation = {
            changeFullScreenMode: changeFullScreenMode
        };
    }

    MenuModalController.$inject = ['$scope', '$uibModalInstance', 'menu', 'currentAction'];
    function MenuModalController($scope, $modalInstance, menu, currentAction) {
        $scope.currentAction = currentAction;
        $scope.menu = menu || {};
        $scope.saveMenu = function () {
            $modalInstance.close($scope.menu);
        };
    }
}());
