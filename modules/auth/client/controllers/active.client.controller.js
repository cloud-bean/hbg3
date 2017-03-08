(function () {
    'use strict';

    angular
    .module('auth')
    .controller('ActiveByTokenController', ActiveByTokenController);

    ActiveByTokenController.$inject = ['$scope', '$stateParams', 'AuthHttp'];

    function ActiveByTokenController($scope, $stateParams, AuthHttp) {
        AuthHttp.activeUserByToken($stateParams.token).then(function (result) {
            $scope.active = result.data ? result.data.active : false;
        });
    }
}());
