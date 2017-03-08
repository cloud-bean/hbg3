/**
 *Copyright 2017 cloud-bean.com.
 *
 * Created by nobody on 7/8/2015.
 */
(function () {
    'use strict';

    angular
    .module('dashboard')
    .controller('EmailController', EmailController)
    .controller('EmailTemplateModalController', EmailTemplateModalController)
    .controller('SendTestEmailModalController', SendTestEmailModalController);

    EmailController.$inject = ['$scope', 'EmailsService', 'textAngularManager', '$uibModal'];
    function EmailController($scope, EmailsService, textAngularManager, $modal) {
        $scope.toolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough'],
            ['ul', 'ol', 'redo', 'undo', 'clear', 'justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent', 'html', 'insertImage', 'insertLink']
        ];

        var refresh = function () {
            $scope.emails = EmailsService.query(function () {
                if (!$scope.emails) return;
                if (!$scope.currentTemplate || !$scope.currentTemplate.title) {
                    $scope.currentTemplate = angular.copy($scope.emails[0]);
                }
            });
        };

        $scope.refresh = refresh;

        $scope.changeCurrentTemplate = function (email) {
            $scope.currentTemplate = angular.copy(email);
        };

        $scope.resetEdit = function () {
            angular.forEach(this.emails, function (email) {
                if (email._id === $scope.currentTemplate._id) {
                    $scope.currentTemplate.subject = email.subject;
                    $scope.currentTemplate.body = email.body;
                }
            });
        };

        $scope.saveTemplate = function () {
            if (!$scope.currentTemplate || !$scope.currentTemplate.subject || !$scope.currentTemplate.body) {
                return;
            }
            $scope.currentTemplate.$update(successCallback, errorCallback);
        };

        $scope.deleteEmailTemplate = function (currentTemplate) {
            if (!currentTemplate) return;
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['template', currentTemplate.name], function () {
                $scope.currentTemplate.$remove(function () {
                    delete $scope.currentTemplate;
                    refresh();
                }, errorCallback);
            });
        };

        $scope.showAddNewEmailTemplateModal = function () {
            var modalInstance = $modal.open({
                templateUrl: '/add_email_template_form',
                controller: 'EmailTemplateModalController',
                resolve: {},
                windowClass: 'modal-common',
                backdrop: 'static'
            });

            modalInstance.result.then(function (emailTemplate) {

                var newEmail = new EmailsService(emailTemplate);
                newEmail.$save(successCallback, errorCallback);
            });
        };

        $scope.showSendTestEmailModal = function (currentTemplate) {
            $modal.open({
                templateUrl: '/send_test_email_form',
                controller: 'SendTestEmailModalController',
                resolve: {
                    currentTemplate: function () {
                        return currentTemplate;
                    }
                },
                windowClass: 'modal-common',
                backdrop: 'static'
            });
        };

        function successCallback(res) {
            refresh();
        }

        function errorCallback(res) {//todo err deal
            $scope.error = res.data.message;
        }
    }

    EmailTemplateModalController.$inject = ['$scope', '$uibModalInstance'];
    function EmailTemplateModalController($scope, $modalInstance) {
        $scope.emailTemplate = {
            name: '',
            title: '',
            target: '',
            subject: ''
        };
        $scope.createEmailTemplate = function () {
            $modalInstance.close($scope.emailTemplate);
        };
    }

    SendTestEmailModalController.$inject = ['$scope', '$uibModalInstance', '$http', 'currentTemplate'];
    function SendTestEmailModalController($scope, $modalInstance, $http, currentTemplate) {
        var variableRegExp = new RegExp(/\{\{[^\}]+\}\}/, 'g');
        var variableStrings = currentTemplate.body.match(variableRegExp);
        var variables = $scope.variables = [];

        variableStrings.forEach(function (variable) {
            var matchAttr = variable.match(/\{\{([\s\S]*?)}}/)[1];
            if (variables.indexOf(matchAttr) === -1) {
                variables.push(matchAttr);
            }
        });

        $scope.sendSampleEmail = function (emailFillInfo) {
            angular.extend(emailFillInfo, {mailTitle: currentTemplate.title});
            $http.post('/app/dashboard/emails/test', emailFillInfo).then(function (result) {
                $modalInstance.close();
            });
        };

    }
}());
