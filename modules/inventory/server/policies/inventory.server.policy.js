/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    
    /**
     * Invoke Inventory Routes Permissions
     */
    exports.invokeRolesPolicies = function (acl) {
        // Internal Routes for Staff
        acl.allow([{
            roles: ['superuser', 'admin'],
            allows: [{
                resources: [
                    '/app/inventories',
                    '/app/inventories/:inventoryId'
                ],
                permissions: ['*']
            }]
        }]);
        
        // Public API Routes for User or Guest.
        acl.allow([{
            roles: ['user'],
            allows: [{
                resources: [
                    '/inventories',
                    '/inventories/:inventoryId'
                ],
                permissions: ['get']
            }]
        }]);
    };
}());
