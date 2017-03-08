(function () {
    'use strict';

    angular
    .module('dashboard.services')
    .factory('ConfigService', ConfigService);

    ConfigService.$inject = ['$http'];

    function ConfigService($http) {
        return {
            saveConfig: function (data) {
                return $http.put('/app/dashboard/config', {option: data.option});
            },
            getConfig: function () {
                return $http.get('/app/dashboard/config');
            },
            sortMenu: function (menus) {
                menus && menus.sort(function (a, b) {
                    return a.order - b.order;
                });
                return menus;
            }
        };
    }
}());
