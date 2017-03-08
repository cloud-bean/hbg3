(function () {
    'use strict';

    angular
        .module('auth')
        .controller('SignoutController', SignoutController);

    SignoutController.$inject = ['$state', 'AuthHttp', 'Authentication'];

    function SignoutController($state, AuthHttp, Authentication) {
        AuthHttp.logout().then(function () {
            Authentication.user = null;
            $state.go('authentication.signin');
        });
    }
}());
