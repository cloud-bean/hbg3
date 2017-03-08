(function () {
    'use strict';

    // Authentication service for user variables

    angular
    .module('auth.services')
    .factory('AuthHttp', AuthHttp);

    AuthHttp.$inject = ['$http'];

    function AuthHttp($http) {
        return {
            //user
            logout: function (user) {
                return $http.get('/app/auth/signout', user);
            },
            login: function (user) {
                return $http.post('/app/auth/signin', user);
            },
            forgotPassword: function (userInfo) {
                return $http.post('/app/auth/password/forgot', userInfo);
            },
            changePasswordByToken: function (passwordInfo) {
                return $http.patch('/app/auth/password/forgot/change', passwordInfo);
            },
            resetPasswordByUser: function (passwordInfo) {
                return $http.patch('/app/auth/password/reset/', passwordInfo);
            },
            changePassword: function (passwords, userId) {
                return $http.put('/app/auth/user/' + userId + '/password', passwords);
            },
            signup: function (orgID, user) {
                if (orgID) {
                    return $http.post('/app/auth/' + orgID + '/user', user);
                } else {
                    return $http.post('/app/auth/users', user);
                }
            },
            updateUser: function (orgID, user) {
                if (orgID) {
                    return $http.put('/app/auth/users/' + orgID + '/user/' + user.userID, user);
                } else {
                    return $http.put('/app/auth/users/' + user._id, user);
                }
            },
            deleteUser: function (orgID, userID) {
                if (orgID) {
                    return $http.delete('/app/auth/' + orgID + '/user/' + userID);
                } else {
                    return $http.delete('/app/auth/users/' + userID);
                }
            },
            activeUserByToken: function (token) {
                return $http.get('/app/auth/users/status/' + token);
            }
        };
    }
}());
