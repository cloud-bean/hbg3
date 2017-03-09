/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
        .module('record')
        .controller('RecordController', RecordController)
        .controller('RecordModalController', RecordModalController);

    RecordController.$inject = ['$scope', '$http', '$uibModal', 'RecordService'];

    function RecordController($scope, $http, $modal, RecordService) {
        $scope.currentRecord = null;
        $scope.pageOptions = {
            page: 1,
            limit: 20
        };

        $scope.searchRecord = function (isArchived) {
            $scope.currentRecord = null;
            refresh();
        };

        var refresh = function () {
            var queryOptions = {
                page: $scope.pageOptions.page,
                limit: $scope.pageOptions.limit,
                searchText: $scope.searchText
            };

            RecordService.query(queryOptions, function (data, headers) {
                $scope.totalItemsCount = headers()['x-total-items-count'];
                $scope.records = data;
                if (!$scope.records.length) {
                    $scope.currentRecord = null;
                } else {
                    if (!$scope.currentRecord) {
                        if ($scope.records.length) {
                            $scope.currentRecord = $scope.records[0];
                        }
                    } else {
                        // update currentRecord
                        var isMatched = $scope.records.some(function (item) {
                            if (item._id === $scope.currentRecord._id) {
                                $scope.currentRecord = item;
                                return true;
                            } else {
                                return false;
                            }
                        });

                        if (!isMatched) {
                            $scope.currentRecord = $scope.records[0];
                        }
                    }
                }
            });
        };

        $scope.selectCurrentRecord = function (record) {
            $scope.currentRecord = record;
        };


        $scope.addRecord = function (record) {
            var model = new RecordService(record);
            model.$save(function () {
                $scope.currentRecord = null;
                $scope.refresh();
            });
        };

        $scope.updateRecord = function (record) {
            if (record === null) {
                return;
            }
            RecordService.update({id: record._id}, record, function () {
                refresh();
            });
        };

        $scope.deleteRecord = function (recordObj) {
            if (recordObj === null) {
                return;
            }
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['record', recordObj.name], function () {
                var record = new RecordService(recordObj);
                record.$remove(function () {
                    $scope.currentRecord = null;
                    refresh();
                });
            });
        };


        $scope.refresh = refresh;

        $scope.recordActions = {
            'add': {
                text: 'Add',
                tpl: '/record_model',
                form: '#addRecordForm',
                title: 'Add New Record',
                action: $scope.addRecord,
                controller: 'RecordModalController'
            },
            'update': {
                text: 'Update',
                tpl: '/record_model',
                form: '#addRecordForm',
                title: 'Modify Record Details',
                action: $scope.updateRecord,
                controller: 'RecordModalController'
            }
        };

        $scope.selectRecord = function (item, action) {
            if (item) {
                $scope.backupEntry = item;
                $scope.resolveRecord = angular.copy(item);
            } else {
                $scope.resolveRecord = {};
            }
            $scope.currentRecordAction = $scope.recordActions[action];
            $scope.showRecordModal();
        };

        $scope.showRecordModal = function () {
            var modalInstance = $modal.open({
                templateUrl: $scope.currentRecordAction.tpl,
                controller: $scope.currentRecordAction.controller,
                resolve: {
                    record: function () {
                        return $scope.resolveRecord;
                    },
                    currentRecordAction: function () {
                        return $scope.currentRecordAction;
                    }
                },
                windowClass: 'modal-common',
                backdrop: 'static'
            });
            modalInstance.result.then(function (record) {
                record && $scope.currentRecordAction.action(record);
            });
        };
    }

    RecordModalController.$inject = ['$scope', '$uibModalInstance', 'record', 'currentRecordAction', '$timeout'];

    function RecordModalController($scope, $modalInstance, record, currentRecordAction, $timeout) {
        $scope.record = record;
        $scope.currentRecordAction = currentRecordAction;

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
            $scope.record.file = (JSON.parse(response)).data;
        };

        $scope.operateRecord = function () {
            $modalInstance.close($scope.record);
        };

        $scope.toInt = function (a) {
            return parseInt(a, 10) * 100;
        };
    }
}());
