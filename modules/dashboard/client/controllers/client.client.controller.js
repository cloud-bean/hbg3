/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
        .module('dashboard')
        .controller('ClientController', ClientController)
        .controller('clientModalController', clientModalController);

    ClientController.$inject = ['$scope', '$uibModal', 'ClientsService'];

    function ClientController($scope, $modal, ClientsService) {

        var refresh = function () {
            ClientsService.query(function (data) {
                $scope.clients = data;
            });
        };

        $scope.refresh = refresh();

        $scope.deleteClient = function (clientObj) {
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['client', clientObj.clientID], function () {
                var client = new ClientsService(clientObj);
                client.$remove(function (res) {
                    refresh();
                });
            });
        };

        $scope.addClient = function () {
            var modalInstance = $modal.open({
                templateUrl: '/add_client_form',
                controller: 'clientModalController',
                windowClass: 'modal-common',
                backdrop: 'static'
            });
            modalInstance.result.then(function (client) {
                new ClientsService(client).$save(function (res) {
                    refresh();
                });
            });
        };

        $scope.refreshClient = function (clientObj) {
            $scope.showConfirmMessage('CMSV_REFRESH_CONFIRM', ['client', clientObj.clientID], function () {
                ClientsService.update({id: clientObj._id}, clientObj);
                refresh();
            });
        };
    }

    clientModalController.$inject = ['$scope', '$uibModalInstance'];
    function clientModalController($scope, $modalInstance) {
        $scope.client = {};
        $scope.create = function () {
            $modalInstance.close($scope.client);
        };
    }

}());
