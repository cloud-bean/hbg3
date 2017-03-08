/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
        .module('dashboard')
        .controller('PolicyController', PolicyController)
        .controller('policyModalController', policyModalController);

    PolicyController.$inject = ['$scope', '$uibModal', 'PolicyService'];

    function PolicyController($scope, $modal, PolicyService) {
        var refresh = function () {
            PolicyService.query(function (data) {
                $scope.policys = data;
            });
        };

        refresh();

        $scope.selectPolicy = function (item, action) {
            if (item) {
                $scope.backupPolicy = item;
                $scope.currentPolicy = angular.copy(item);
            } else {
                $scope.currentPolicy = {};
            }
            $scope.currentPolicyAction = $scope.policyActions[action];
            $scope.showPolicyModal();
        };

        $scope.showPolicyModal = function () {
            var modalInstance = $modal.open({
                templateUrl: '/policy_modal',
                controller: 'policyModalController',
                resolve: {
                    currentPolicyAction: function () {
                        return $scope.currentPolicyAction;
                    },
                    policy: function () {
                        return $scope.currentPolicy;
                    }
                },
                windowClass: 'modal-common',
                charAtbackdrop: 'static'
            });
            modalInstance.result.then(function (policy) {
                $scope.currentPolicyAction.action(policy);
            });
        };

        $scope.addPolicy = function (policyObj) {
            if (policyObj === null) {
                return;
            }
            var policy = new PolicyService(policyObj);
            policy.$save(function (res) {
                refresh();
            });
        };

        $scope.updatePolicy = function (policyObj) {
            if (policyObj === null) {
                return;
            }
            PolicyService.update({id: policyObj._id}, policyObj);
            refresh();
        };

        $scope.deletePolicy = function (policyObj) {
            if (policyObj === null) {
                return;
            }
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['policy', policyObj.policyName], function () {

                var policy = new PolicyService(policyObj);
                policy.$remove(function (res) {
                    refresh();
                });
            });
        };

        $scope.policyActions = {
            'add': {
                text: 'Add',
                tpl: '/add_policy_form',
                form: '#add_policy_form',
                title: 'Add New policy',
                action: $scope.addPolicy
            },
            'update': {
                text: 'Update',
                tpl: '/add_policy_form',
                form: '#modify_policy_form',
                title: 'Modify policy Details',
                action: $scope.updatePolicy
            }
        };
    }

    policyModalController.$inject = ['$scope', '$uibModalInstance', 'currentPolicyAction', 'policy'];

    function policyModalController($scope, $modalInstance, currentPolicyAction, policy) {
        $scope.policy = policy;
        if (!policy.options) {
            $scope.policy.options = '{}';
        }
        $scope.current = {};
        $scope.currentPolicyAction = currentPolicyAction;

        $scope.testPolicy = function (options) {
            try {
                var test = JSON.parse(options);
                return true;
            } catch (e) {
                return false;
            }
        };

        $scope.operatePolicy = function () {
            $scope.current = {};
            $modalInstance.close($scope.policy);
        };
    }

}());
