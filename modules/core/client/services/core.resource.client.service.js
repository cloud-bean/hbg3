(function () {
    'use strict';

    angular
        .module('core')
        .factory('resourceService', resourceService);

    resourceService.$inject = ['$resource'];

    function resourceService($resource) {
        return function (url, params, methods) {
            var defaults = {
                update: {method: 'PUT'},
                create: {method: 'POST'}
            };

            methods = angular.extend(defaults, methods);

            var resource = $resource(url, params, methods);

            resource.prototype.$save = function (success, error) {
                if (!this._id) {
                    return this.$create(success, error);
                } else {
                    return this.$update(success, error);
                }
            };

            return resource;
        };
    }
}());
