(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('PasswordService', PasswordService);

    PasswordService.$inject = ['$resource'];

    function PasswordService($resource) {
        return $resource('/app/auth/user/:userId/password', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
