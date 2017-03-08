(function () {
    'use strict';

    angular
        .module('dashboard')
        .run(dashboardConfig);

    dashboardConfig.$inject = ['$rootScope', '$window'];

    function dashboardConfig($rootScope, $window) {
        $rootScope.mainTitle = $window.document.title || 'CommonService';
    }
}());
