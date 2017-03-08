/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
          .module('record.services')
          .factory('RecordService', RecordService);
      
      RecordService.$inject = ['$resource'];
      
      function RecordService($resource) {
          return $resource('app/records/:recordId', {
              recordId: '@_id'
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
