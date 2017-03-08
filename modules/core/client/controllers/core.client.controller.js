(function () {
    'use strict';

    angular
        .module('core.controller')
        .controller('ApplicationHomeController', ApplicationHomeController);

    ApplicationHomeController.$inject = ['$scope', 'Authentication'];

    function ApplicationHomeController($scope, Authentication) {
        $scope.authentication = Authentication;
    }
}());
