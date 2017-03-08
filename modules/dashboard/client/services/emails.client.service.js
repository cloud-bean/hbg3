(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('EmailsService', EmailsService);

    EmailsService.$inject = ['$resource'];

    function EmailsService($resource) {
        return $resource('app/dashboard/emails/:emailId', {
            emailId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
