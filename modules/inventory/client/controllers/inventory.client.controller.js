/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
        .module('inventory')
        .controller('InventoryController', InventoryController)
        .controller('InventoryModalController', InventoryModalController);

    InventoryController.$inject = ['$scope', '$http', '$uibModal', 'InventoryService'];

    function InventoryController($scope, $http, $modal, InventoryService) {
        $scope.currentInventory = null;
        $scope.pageOptions = {
            page: 1,
            limit: 20
        };

        $scope.searchInventory = function (isArchived) {
            $scope.currentInventory = null;
            refresh();
        };

        var refresh = function () {
            var queryOptions = {
                page: $scope.pageOptions.page,
                limit: $scope.pageOptions.limit,
                searchText: $scope.searchText
            };

            InventoryService.query(queryOptions, function (data, headers) {
                $scope.totalItemsCount = headers()['x-total-items-count'];
                $scope.inventories = data;
                if (!$scope.inventories.length) {
                    $scope.currentInventory = null;
                } else {
                    if (!$scope.currentInventory) {
                        if ($scope.inventories.length) {
                            $scope.currentInventory = $scope.inventories[0];
                        }
                    } else {
                        // update currentInventory
                        var isMatched = $scope.inventories.some(function (item) {
                            if (item._id === $scope.currentInventory._id) {
                                $scope.currentInventory = item;
                                return true;
                            } else {
                                return false;
                            }
                        });

                        if (!isMatched) {
                            $scope.currentInventory = $scope.inventories[0];
                        }
                    }
                }
            });
        };

        $scope.selectCurrentInventory = function (inventory) {
            $scope.currentInventory = inventory;
        };


        $scope.addInventory = function (inventory) {
            var model = new InventoryService(inventory);
            model.$save(function () {
                $scope.currentInventory = null;
                $scope.refresh();
            });
        };

        $scope.updateInventory = function (inventory) {
            if (inventory === null) {
                return;
            }
            InventoryService.update({id: inventory._id}, inventory, function () {
                refresh();
            });
        };

        $scope.deleteInventory = function (inventoryObj) {
            if (inventoryObj === null) {
                return;
            }
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['inventory', inventoryObj.name], function () {
                var inventory = new InventoryService(inventoryObj);
                inventory.$remove(function () {
                    $scope.currentInventory = null;
                    refresh();
                });
            });
        };


        $scope.refresh = refresh;

        $scope.inventoryActions = {
            'add': {
                text: 'Add',
                tpl: '/inventory_model',
                form: '#addInventoryForm',
                title: 'Add New Inventory',
                action: $scope.addInventory,
                controller: 'InventoryModalController'
            },
            'update': {
                text: 'Update',
                tpl: '/inventory_model',
                form: '#addInventoryForm',
                title: 'Modify Inventory Details',
                action: $scope.updateInventory,
                controller: 'InventoryModalController'
            }
        };

        $scope.selectInventory = function (item, action) {
            if (item) {
                $scope.backupEntry = item;
                $scope.resolveInventory = angular.copy(item);
            } else {
                $scope.resolveInventory = {};
            }
            $scope.currentInventoryAction = $scope.inventoryActions[action];
            $scope.showInventoryModal();
        };

        $scope.showInventoryModal = function () {
            var modalInstance = $modal.open({
                templateUrl: $scope.currentInventoryAction.tpl,
                controller: $scope.currentInventoryAction.controller,
                resolve: {
                    inventory: function () {
                        return $scope.resolveInventory;
                    },
                    currentInventoryAction: function () {
                        return $scope.currentInventoryAction;
                    }
                },
                windowClass: 'modal-common',
                backdrop: 'static'
            });
            modalInstance.result.then(function (inventory) {
                inventory && $scope.currentInventoryAction.action(inventory);
            });
        };
    }

    InventoryModalController.$inject = ['$scope', '$uibModalInstance', 'inventory', 'currentInventoryAction', '$timeout'];

    function InventoryModalController($scope, $modalInstance, inventory, currentInventoryAction, $timeout) {
        $scope.inventory = inventory;
        $scope.currentInventoryAction = currentInventoryAction;

        $scope.dealWithFilesOneSubmitted = function ($files, $event, $flowFile) {
            if ($flowFile.files.length === 0) {
                return 0;
            } else {
                $scope.$flowFile = $flowFile;
                $scope.showProgress = true;
                $scope.$flowFile.upload();
            }
        };

        $scope.flowOptions = {
            singleFile: true
        };

        $scope.multiFile = !$scope.flowOptions || !$scope.flowOptions.singleFile;

        $scope.validateImg = function (file) {
            if (file.size > 10 * 1024 * 1024) {
                $scope.showConfirmMessage('CMSV_SIZE_LARGE', ['10M'], function () {
                });
                return false;
            }
        };

        $scope.uploadSuccess = function (response) {
            $scope.inventory.file = (JSON.parse(response)).data;
        };

        $scope.operateInventory = function () {
            $modalInstance.close($scope.inventory);
        };

        $scope.toInt = function (a) {
            return parseInt(a, 10) * 100;
        };
    }
}());
