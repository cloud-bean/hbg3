/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
          .module('member.services')
          .factory('MemberService', MemberService);

    MemberService.$inject = ['$resource'];

    function MemberService($resource) {
        return $resource('app/members/:memberId', {
            memberId: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }
}());
