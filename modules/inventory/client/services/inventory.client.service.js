/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    angular
          .module('inventory.services')
          .factory('InventoryService', InventoryService);
      
      InventoryService.$inject = ['$resource'];
      
      function InventoryService($resource) {
          return $resource('app/inventories/:inventoryId', {
              inventoryId: '@_id'
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
