/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
        .module('member')
        .controller('MemberController', MemberController)
        .controller('MemberModalController', MemberModalController);
    
    MemberController.$inject = ['$scope', '$http', '$uibModal', 'MemberService'];
    
    function MemberController($scope, $http, $modal, MemberService) {
        $scope.currentMember = null;
        $scope.pageOptions = {
            page: 1,
            limit: 20
        };
        
        $scope.searchMember = function (isArchived) {
            $scope.currentMember = null;
            refresh();
        };
        
        var refresh = function () {
            var queryOptions = {
                page: $scope.pageOptions.page,
                limit: $scope.pageOptions.limit,
                searchText: $scope.searchText
            };
            
            MemberService.query(queryOptions, function (data, headers) {
                $scope.totalItemsCount = headers()['x-total-items-count'];
                $scope.members = data;
                if (!$scope.members.length) {
                    $scope.currentMember = null;
                } else {
                    if (!$scope.currentMember) {
                        if ($scope.members.length) {
                            $scope.currentMember = $scope.members[0];
                        }
                    } else {
                        // update currentMember
                        var isMatched = $scope.members.some(function (item) {
                            if (item._id === $scope.currentMember._id) {
                                $scope.currentMember = item;
                                return true;
                            } else {
                                return false;
                            }
                        });
                        
                        if (!isMatched) {
                            $scope.currentMember = $scope.members[0];
                        }
                    }
                }
            })
        };
        
        $scope.selectCurrentMember = function (member) {
            $scope.currentMember = member;
        };
        
        
        $scope.addMember = function (member) {
            var model = new MemberService(member);
            model.$save(function () {
                $scope.currentMember = null;
                $scope.refresh();
            })
        };
        
        $scope.updateMember = function (member) {
            if (member === null) {
                return;
            }
            MemberService.update({id: member._id}, member, function () {
                refresh();
            });
        };
        
        $scope.deleteMember = function (memberObj) {
            if (memberObj === null) {
                return;
            }
            $scope.showConfirmMessage('CMSV_DELETE_CONFIRM', ['member', memberObj.name], function () {
                var member = new MemberService(memberObj);
                member.$remove(function () {
                    $scope.currentMember = null;
                    refresh();
                });
            });
        };
        
        
        $scope.refresh = refresh;
        
        $scope.memberActions = {
            'add': {
                text: 'Add',
                tpl: '/member_model',
                form: '#addMemberForm',
                title: 'Add New Member',
                action: $scope.addMember,
                controller: 'MemberModalController'
            },
            'update': {
                text: 'Update',
                tpl: '/member_model',
                form: '#addMemberForm',
                title: 'Modify Member Details',
                action: $scope.updateMember,
                controller: 'MemberModalController'
            }
        };
        
        $scope.selectMember = function (item, action) {
            if (item) {
                $scope.backupEntry = item;
                $scope.resolveMember = angular.copy(item);
            } else {
                $scope.resolveMember = {};
            }
            $scope.currentMemberAction = $scope.memberActions[action];
            $scope.showMemberModal();
        };
        
        $scope.showMemberModal = function () {
            var modalInstance = $modal.open({
                templateUrl: $scope.currentMemberAction.tpl,
                controller: $scope.currentMemberAction.controller,
                resolve: {
                    member: function () {
                        return $scope.resolveMember;
                    },
                    currentMemberAction: function () {
                        return $scope.currentMemberAction
                    }
                },
                windowClass: 'modal-common',
                backdrop: 'static'
            });
            modalInstance.result.then(function (member) {
                member && $scope.currentMemberAction.action(member);
            });
        };
    }
    
    MemberModalController.$inject = ['$scope', '$uibModalInstance', 'member', 'currentMemberAction', '$timeout'];
    
    function MemberModalController($scope, $modalInstance, member, currentMemberAction, $timeout) {
        $scope.member = member;
        $scope.currentMemberAction = currentMemberAction;
        
        $scope.dealWithFilesOneSubmitted = function ($files, $event, $flowFile) {
            if ($flowFile.files.length === 0) {
                return 0;
            } else {
                $scope.$flowFile = $flowFile;
                $scope.showProgress = true;
                $scope.$flowFile.upload();
            }
        };
        
        $scope.flowOptions = {
            singleFile: true
        };
        
        $scope.multiFile = !$scope.flowOptions || !$scope.flowOptions.singleFile;
        
        $scope.validateImg = function (file) {
            if (file.size > 10 * 1024 * 1024) {
                $scope.showConfirmMessage('CMSV_SIZE_LARGE', ['10M'], function () {
                });
                return false;
            }
        };
        
        $scope.uploadSuccess = function (response) {
            $scope.member.file = (JSON.parse(response)).data;
        };
        
        $scope.operateMember = function () {
            $modalInstance.close($scope.member);
        };
        
        $scope.toInt = function (a) {
            return parseInt(a, 10) * 100;
        }
    }
}());
