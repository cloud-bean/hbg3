(function () {
    'use strict';
    angular
    .module('dashboard')
    .controller('StaffController', StaffController)
    .controller('UserModalController', UserModalController);
    StaffController.$inject = ['$scope', '$uibModal', 'UsersService', 'PasswordService'];
    function StaffController($scope, $modal, UsersService, PasswordService) {
        $scope.pageOptions = {
            page: 1,
            limit: 20
        };
        $scope.resetPage = function () {
            $scope.pageOptions.page = 1;
        };
        $scope.refreshUser = function () {
            var queryOptions = {
                page: $scope.pageOptions.page,
                limit: $scope.pageOptions.limit,
                searchText: $scope.searchText,
                roles: 'admin'
            };
            UsersService.query(queryOptions, function (data, headers) {
                $scope.totalItemsCount = headers()['x-total-items-count'];
                $scope.users = data;
                if (!$scope.users) return;
            });
        };
        var refresh = function () {
            $scope.refreshUser();
        };
        $scope.hash = window.location.hash.substring(2);
        $scope.selectUser = function (item, action) {
            if (item) {
                $scope.backupUser = item;
                $scope.currentUser = angular.copy(item);
            } else {
                $scope.currentUser = {};
            }
            $scope.currentUserAction = $scope.userActions[action];
            $scope.showUserModal();
        };
        $scope.showUserModal = function () {
            var modalInstance = $modal.open({
                templateUrl: '/staff_modal',
                controller: 'UserModalController',
                resolve: {
                    currentUserAction: function () {
                        return $scope.currentUserAction;
                    },
                    user: function () {
                        return $scope.currentUser;
                    },
                    currentOrganization: function () {
                        return $scope.currentOrganization;
                    }
                },
                windowClass: 'modal-common',
                backdrop: 'static'
            });
            modalInstance.result.then(function (user) {
                $scope.currentUserAction.action(user);
            });
        };
        $scope.addUser = function (userObj) {
            if (userObj === null) {
                return;
            }
            userObj.isAdmin = true;
            var user = new UsersService(userObj);
            user.$save(function (res) {
                refresh();
            });
        };
        $scope.updateUser = function (userObj) {
            if (userObj === null) return;
            var updateInfo = {
                firstName: userObj.firstName,
                middleName: userObj.middleName,
                lastName: userObj.lastName,
                roles: userObj.roles
            };
            UsersService.update({userId: userObj._id}, updateInfo, function (res) {
                refresh();
            });
        };
        $scope.changeUserStatus = function (userObj) {
            if (userObj === null) return;
            UsersService.update({userId: userObj._id}, {
                action: 'status',
                active: userObj.status === -1
            }, function (res) {
                refresh();
            });
        };
        $scope.deleteUser = function (userObj) {
            if (userObj === null || userObj.status === 1) return;
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['user', userObj.email], function () {
                var user = new UsersService(userObj);
                user.$remove(function (res) {
                    refresh();
                });
            });
        };
        $scope.resetPassword = function (userObj) {
            if (userObj === null || userObj.status === -1) return;
            $scope.showConfirmMessage('CMSV_PASS_RESET_CONFIRM', {}, function () {
                PasswordService.query({userId: userObj._id}, function (res) {
                    refresh();
                });
            });
        };
        $scope.userActions = {
            'add': {
                text: 'Add',
                tpl: '/add_staff_form',
                form: '#add_staff_form',
                title: 'Add New Staff',
                action: $scope.addUser
            },
            'update': {
                text: 'Update',
                tpl: '/add_staff_form',
                form: '#add_staff_form',
                title: 'Modify Staff Details',
                action: $scope.updateUser
            },
            'deactivate': {
                text: 'Deactivate',
                tpl: '/deactivate_staff_form',
                form: '#deactivate_staff_form',
                title: 'Deactivate Staff',
                action: $scope.changeUserStatus
            },
            'activate': {
                text: 'Activate',
                tpl: '/deactivate_staff_form',
                form: '#deactivate_stuff_form',
                title: 'Activate Staff',
                action: $scope.changeUserStatus
            }
        };
        function successCallback(res) {
            refresh();
        }

        function errorCallback(res) {//todo err deal
            $scope.error = res.data.message;
        }
    }

    UserModalController.$inject = ['$scope', '$uibModalInstance', 'currentUserAction', 'user', 'currentOrganization', 'Authentication'];
    function UserModalController($scope, $modalInstance, currentUserAction, user, currentOrganization, authentication) {
        $scope.user = user;
        $scope.loginUserGroup = authentication.user.group;
        $scope.current = {};
        $scope.currentUserAction = currentUserAction;
        $scope.currentOrganization = currentOrganization;
        if ($scope.user.changeReason !== '') {
            $scope.user.changeReason = '';
        }
        $scope.operateUser = function () {
            $scope.current = {};
            $scope.user.roles = ['admin'];
            $modalInstance.close($scope.user);
        };
    }
}());
