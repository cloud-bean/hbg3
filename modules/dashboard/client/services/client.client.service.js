(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('ClientsService', ClientsService);

    ClientsService.$inject = ['$resource'];

    function ClientsService($resource) {
        return $resource('/app/auth/clients/:clientId', {
            clientId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
