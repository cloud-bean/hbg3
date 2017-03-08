(function () {
    'use strict';

    angular
        .module('dashboard')
        .config(uploadConfig);

    uploadConfig.$inject = ['flowFactoryProvider'];

    function uploadConfig(flowFactoryProvider) {
        flowFactoryProvider.defaults = {
            singleFile: true,
            testChunks: false,
            maxChunkRetries: 1,
            simultaneousUploads: 4,
            chunkRetryInterval: 5000,
            target: '/app/tool/files',
            chunkSize: 10 * 1024 * 1024,
            permanentErrors: [404, 500, 501],
            headers: {
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            }
        };
    }

}());
