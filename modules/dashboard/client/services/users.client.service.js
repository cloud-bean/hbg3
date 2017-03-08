(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('UsersService', UsersService);

    UsersService.$inject = ['$resource'];

    function UsersService($resource) {
        return $resource('/app/auth/users/:userId/:action', {
            userId: '@_id',
            action: '@action'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
