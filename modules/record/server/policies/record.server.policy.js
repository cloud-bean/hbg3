/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    
    /**
     * Invoke Record Routes Permissions
     */
    exports.invokeRolesPolicies = function (acl) {
        // Internal Routes for Staff
        acl.allow([{
            roles: ['superuser', 'admin'],
            allows: [{
                resources: [
                    '/app/records',
                    '/app/records/:recordId'
                ],
                permissions: ['*']
            }]
        }]);
        
        // Public API Routes for User or Guest.
        acl.allow([{
            roles: ['user'],
            allows: [{
                resources: [
                    '/records',
                    '/records/:recordId'
                ],
                permissions: ['get']
            }]
        }]);
    };
}());
