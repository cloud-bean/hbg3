(function () {
    'use strict';

    angular
        .module('dashboard.services')
        .factory('FilesService', FilesService);

    FilesService.$inject = ['$resource'];

    function FilesService($resource) {
        return $resource('app/tool/files/:fileId', {
            fileId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
}());
