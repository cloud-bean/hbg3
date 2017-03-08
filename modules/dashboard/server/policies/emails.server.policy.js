'use strict';

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function (acl) {
    acl.allow([{
        roles: ['admin', 'superuser'],
        allows: [{
            resources: '/app/dashboard/emails',
            permissions: ['get', 'post']
        }, {
            resources: '/app/dashboard/emails/:emailId',
            permissions: '*'
        }, {
            resources: '/app/dashboard/emails/test',
            permissions: 'post'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/app/dashboard/emails',
            permissions: ['get']
        }, {
            resources: '/app/dashboard/emails/:emailId',
            permissions: ['get']
        }]
    }]);
};
