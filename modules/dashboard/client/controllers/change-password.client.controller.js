/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 07/23/2015.
 */

(function () {
    'use strict';

    angular
        .module('dashboard')
        .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$inject = ['Authentication', '$scope', 'PasswordService'];

    function ChangePasswordController(Authentication, $scope, PasswordService) {
        $scope.passwords = {};

        $scope.changePassword = function () {
            var user = Authentication.user;
            PasswordService.update({userId: user._id}, $scope.passwords);
        };
        $scope.reset = function () {
            $scope.changePwdForm.$setPristine();
            $scope.passwords = {
                'password': '',
                'newPassword': '',
                'confirmPassword': ''
            };
        };
    }
}());
