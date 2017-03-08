/**
 *
 * Created by hygkui on 2017/3/8
 */
(function () {
    'use strict';
    
    /**
     * Invoke Member Routes Permissions
     */
    exports.invokeRolesPolicies = function (acl) {
        // Internal Routes for Staff
        acl.allow([{
            roles: ['superuser', 'admin'],
            allows: [{
                resources: [
                    '/app/members',
                    '/app/members/:memberId'
                ],
                permissions: ['*']
            }]
        }]);
        
        // Public API Routes for User or Guest.
        acl.allow([{
            roles: ['user'],
            allows: [{
                resources: [
                    '/members',
                    '/members/:memberId'
                ],
                permissions: ['get']
            }]
        }]);
    };
}());
