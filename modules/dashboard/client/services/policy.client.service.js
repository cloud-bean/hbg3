(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('PolicyService', PolicyService);

    PolicyService.$inject = ['$resource'];

    function PolicyService($resource) {
        return $resource('/app/auth/policys/:policyID', {
            policyID: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
