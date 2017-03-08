'use strict';

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function (acl) {

    // internal API.
    acl.allow([{
        roles: ['superuser', 'admin'],
        allows: [{
            resources: [
                '/app/auth/clients',
                '/app/auth/clients/:clientID',
                '/app/auth/policys',
                '/app/auth/policys/:policyID',
                '/app/auth/users',
                '/app/auth/users/:userId',
                '/app/auth/users/:userId/status',
                '/app/auth/user/:userId/password',
                '/app/auth/users/status/:token'
            ],
            permissions: ['*']
        }
        ]
    }
    ]);

    // public API.
    acl.allow([{
        roles: ['superuser', 'admin', 'user'],
        allows: [{
            resources: [
                '/users/:userId',
                '/users/:userId/change/password'
            ],
            permissions: ['*']
        }
        ]
    }, {
        roles: ['superuser', 'admin', 'user', 'guest'],
        allows: [{
            resources: [
                '/users',
                '/policy',
                '/users/attribute/inspect'
            ],
            permissions: ['post']
        }
        ]
    }, {
        roles: ['guest'],
        allows: [{
            resources: [
                '/users/status/:token'
            ],
            permissions: ['get']
        }
        ]
    }
    ]);
};
