(function () {
    'use strict';

    angular
        .module('auth')
        .controller('changePasswordByTokenController', changePasswordByTokenController);

    changePasswordByTokenController.$inject = ['$scope', '$state', 'AuthHttp'];

    function changePasswordByTokenController($scope, $state, AuthHttp) {
        $scope.resetpass = {};
        $scope.resetPassword = function () {
            AuthHttp.changePasswordByToken($scope.resetpass).then(function () {
                $state.go('authentication.signin');
            });
        };
    }
}());
