(function () {
    'use strict';

    angular
        .module('core')
        .factory('errorHttpInterceptor', errorHttpInterceptor);

    errorHttpInterceptor.$inject = ['$q', '$rootScope', '$injector'];

    function errorHttpInterceptor($q, $rootScope, $injector) {
        $rootScope.mainLoading = false;
        $rootScope.http = null;

        return {
            'request': function (config) {
                if ((!config.headers || !config.headers.background)) {
                    $rootScope.mainLoading = true;
                }
                return config || $q.when(config);
            },
            'requestError': function (rejection) {
                $rootScope.http = $rootScope.http || $injector.get('$http');
                if ($rootScope.http.pendingRequests.length < 1) {
                    $rootScope.mainLoading = false;
                }

                return $q.reject(rejection);
            },
            'response': function (response) {
                $rootScope.http = $rootScope.http || $injector.get('$http');
                if ($rootScope.http.pendingRequests.length < 1) {
                    $rootScope.mainLoading = false;
                }

                if (response.data.code) {
                    if (response.data.code !== 'success') {
                        $rootScope.showMessage(response.data);
                    }
                    response.data = response.data.data;
                }

                return response || $q.when(response);
            },
            'responseError': function (rejection) {
                $rootScope.http = $rootScope.http || $injector.get('$http');
                if ($rootScope.http.pendingRequests.length < 1) {
                    $rootScope.mainLoading = false;
                }
                rejection.config.method !== 'JSONP' && $rootScope.showMessage(rejection.status + '');
                return $q.reject(rejection);
            }
        };
    }
}());
