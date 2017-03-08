(function () {
    'use strict';

    angular
        .module('core.routes')
        .run(messageConfig);

    messageConfig.$inject = ['$rootScope', '$uibModal', '$interval'];

    function messageConfig($rootScope, $uibModal, $interval) {
        var clientMessages = {
            'CMSV_DELETE_CONFIRM': {
                message: 'Are you sure you want to delete this {0} `<b>{1}</b>`?',
                type: 'confirm'
            },
            'CMSV_PASS_RESET_CONFIRM': {
                message: 'Are you sure you want to reset the password?',
                type: 'confirm'
            },
            '500': {
                message: 'The server is temporarily unavailable, Please try again later.',
                type: 'danger',
                alert: true
            },
            'CMSV_REFRESH_CONFIRM': {
                message: 'Are you sure you want to refresh this {0} `<b>{1}</b>`?',
                type: 'confirm'
            },
            'CMSV_SIZE_LARGE': {
                message: 'The size of the image should be less than {0}.',
                type: 'confirm'
            }
        };

        $rootScope.alertMessages = [];

        var stopTime;
        var showMessage = function (messageObject, callback) {
            if (!messageObject.message) {
                return;
            }
            if (messageObject.alert) {
                $rootScope.alertMessages.push({
                    type: messageObject.type,
                    message: messageObject.message
                });
                if (angular.isDefined(stopTime)) {
                    return;
                }
                stopTime = $interval(function () {
                    if ($rootScope.alertMessages.length === 0) {
                        $interval.cancel(stopTime);
                        stopTime = undefined;
                    } else {
                        $rootScope.alertMessages.shift();
                    }
                }, 5000);
            } else {
                var modalInstance = $uibModal.open({
                    templateUrl: 'main_message.html',
                    backdrop: 'static',
                    controller: 'CommonModalController',
                    resolve: {
                        messageObject: function () {
                            return messageObject;
                        }
                    },
                    windowClass: 'modal-common message-modal'
                });

                modalInstance.result.then(function (result) {
                    if (callback && result === 'yes') callback(result);
                });
            }
        };
        $rootScope.showMessage = showMessage;

        $rootScope.showConfirmMessage = function (code, data, callback) {

            var messageObject = {},
                mainMessage = '';
            var format = function (string, object) {
                if (typeof string !== 'string' || !object) return string;
                return string.replace(/{([^{}]*)}/g, function (match, group_match) {
                    var data = object[group_match];
                    return typeof data === 'string' ? data : match;
                });
            };

            mainMessage = clientMessages[code] || clientMessages['500'];

            messageObject.code = code;
            messageObject.messageData = data || {};
            if (mainMessage.type) {
                messageObject.type = mainMessage.type;
                messageObject.action = mainMessage.action || 'OK';
                messageObject.message = format(mainMessage.message, data || {});
            } else {
                messageObject.type = 'error';
                messageObject.message = format(mainMessage, data || {});
            }
            showMessage(messageObject, callback);
        };
    }

    angular
        .module('core.routes')
        .controller('CommonModalController', CommonModalController);
    CommonModalController.$inject = ['$scope', '$uibModalInstance', 'messageObject'];

    function CommonModalController($scope, $modalInstance, messageObject) {
        $scope.messageObject = messageObject;
        var login = function () {
            window.location = '/authentication/login'; // problem!!! will reload this url twice.
        };
        var home = function () {
            window.location = '/';
        };

        var actions = {
            'login': login,
            'home': home,
            '401': login,
            '404': home,
            '600': login,
            'CMSV_NEW_PASSWORD_LOGIN': login
        };

        $scope.ok = function () {
            var callback = messageObject.action ? actions[messageObject.action] : actions[messageObject.code];
            if (callback) {
                callback();
            }
            $modalInstance.close('yes');
        };
    }

}());
