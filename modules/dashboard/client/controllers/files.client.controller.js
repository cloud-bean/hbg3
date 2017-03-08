/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
        .module('dashboard')
        .controller('FilesController', FilesController)
        .controller('uploadModalController', uploadModalController);

    FilesController.$inject = ['$scope', '$uibModal', 'FilesService'];

    function FilesController($scope, $modal, FilesService) {
        $scope.pageOptions = {
            page: 1,
            limit: 24
        };

        $scope.resetPage = function () {
            $scope.pageOptions.page = 1;
        };

        $scope.refreshFile = function () {
            var queryOptions = {
                page: $scope.pageOptions.page,
                limit: $scope.pageOptions.limit
            };
            FilesService.query(queryOptions, function (data, headers) {
                $scope.totalItemsCount = headers()['x-total-items-count'];
                $scope.files = data;
                if (!$scope.files) return;
            });
        };

        var refresh = function () {
            if ($scope.refreshFile)$scope.refreshFile();
        };

        $scope.deleteFile = function (file) {
            if (file === null) return;
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['file', file.fileName], function () {
                file.$remove(function (result) {
                    refresh();
                });
            });
        };

        $scope.openUploadModal = function () {
            var modalInstance = $modal.open({
                templateUrl: '/upload_modal',
                controller: 'uploadModalController',
                windowClass: 'modal-common',
                charAtbackdrop: 'static'
            });
            modalInstance.result.then(function (file) {
                if (file) {
                    refresh();
                }
            });
        };
    }

    uploadModalController.$inject = ['$scope', '$uibModalInstance'];

    function uploadModalController($scope, $modalInstance) {
        $scope.dealWithFilesOnSubmitted = function ($files, $event, $flowFile) {
            if ($flowFile.files.length === 0) {
                return 0;
            } else {
                $scope.$flowFile = $flowFile;
            }
        };

        $scope.uploadLoadFile = function () {
            $scope.showProgress = true;
            $scope.$flowFile.upload();
        };

        $scope.flowOptions = {
            singleFile: false
        };

        $scope.multiFile = !$scope.flowOptions || !$scope.flowOptions.singleFile;

        $scope.validateImg = function (file) {
            if (file.size > 10 * 1024 * 1024) {
                $scope.showConfirmMessage('CMSV_SIZE_LARGE', ['10M'], function () {
                });
                return false;
            }
        };

        var successFilesNum = 0;

        $scope.closeModal = function () {
            successFilesNum++;
            if (successFilesNum === $scope.$flowFile.files.length) {
                $modalInstance.close($scope.$flowFile);
            }
        };
    }
}());
