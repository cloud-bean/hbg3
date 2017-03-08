(function () {
    'use strict';

    angular
        .module('auth')
        .controller('AuthenticationController', AuthenticationController);

    AuthenticationController.$inject = ['$scope', '$state', 'AuthHttp', 'Authentication'];

    function AuthenticationController($scope, $state, AuthHttp, Authentication) {
        $scope.currentAction = 'login';
        $scope.authentication = Authentication;
        $scope.user = {};

        $scope.templates = {
            'login': {
                tpl: '/login_form',
                form: '#login_form',
                title: 'User Authentication'
            },
            'first': {
                tpl: '/firstlogin_form',
                form: '#firstlogin_form',
                title: 'Change Password'
            },
            'forgot': {
                tpl: '/forgotpassword_form',
                form: '#forgotpassword_form',
                title: 'Forgot Password'
            }
        };

        $scope.changepass = {};
        $scope.forgotpass = {};
        $scope.resetpass = {};
        $scope.partner = {};

        $scope.changeAction = function (action) {
            $scope.errorMessage = null;
            $scope.user = {};
            $scope.changepass = {};
            $scope.forgotpass = {};
            $scope.partner = {};
            $scope.currentAction = action;
        };

        $scope.submit = function (event) {
            if (event.keyCode === 13) {
                if ($scope.currentAction === 'first') {
                    $scope.changePassword();
                } else if ($scope.currentAction === 'forgot') {
                    $scope.forgotPassword();
                } else {
                    $scope.login();
                }
            }
        };

        $scope.login = function () {
            AuthHttp.login($scope.user).then(function (result) {
                var user = result.data;
                if (!user) return;

                $scope.authentication.user = user;

                if (user.status === 0) {
                    $scope.currentAction = 'first';
                } else {
                    $scope.$root.mainLoading = true;
                    $state.go($state.previous.state.name || 'dashboard', $state.previous.params);
                }
            });
        };

        $scope.changePassword = function () {
            AuthHttp.changePassword($scope.changepass, $scope.authentication.user._id).then(function (result) {
                if (!result) return;
                $scope.changepass = {};
                $scope.user = {};
                $scope.currentAction = 'login';
            });
        };

        $scope.forgotPassword = function () {
            AuthHttp.forgotPassword($scope.forgotpass).then(function (result) {
                if (!result) return;
                $scope.forgotpass = {};
                $scope.currentAction = 'login';
            });
        };

        $scope.resetPassword = function () {
            AuthHttp.resetPasswordByUser($scope.resetpass).then(function (result) {
                if (!result) return;
                $scope.resetpass = {};
            });
        };
    }
}());
