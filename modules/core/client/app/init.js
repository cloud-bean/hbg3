(function (app) {
    'use strict';

    // Start by defining the main module and adding the module dependencies
    angular
        .module(app.applicationModuleName, app.applicationModuleVendorDependencies);

    // Setting HTML5 Location Mode
    angular
        .module(app.applicationModuleName)
        .config(bootstrapConfig);

    function bootstrapConfig($locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');

        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('errorHttpInterceptor');
        // Tell the module to store the language in the cookie
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.timeout = 60000;
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
        if (csrfToken) {
            ($httpProvider.defaults.headers.common['X-CSRF-Token'] = csrfToken);
        }
    }

    bootstrapConfig.$inject = ['$locationProvider', '$httpProvider'];

    // Then define the init function for starting up the application
    angular.element(document).ready(init);

    function init() {
        // Fixing facebook bug with redirect
        if (window.location.hash && window.location.hash === '#_=_') {
            if (window.history && history.pushState) {
                window.history.pushState('', document.title, window.location.pathname);
            } else {
                // Prevent scrolling by storing the page's current scroll offset
                var scroll = {
                    top: document.body.scrollTop,
                    left: document.body.scrollLeft
                };
                window.location.hash = '';
                // Restore the scroll offset, should be flicker free
                document.body.scrollTop = scroll.top;
                document.body.scrollLeft = scroll.left;
            }
        }

        // Then init the app
        angular.bootstrap(document, [app.applicationModuleName]);
    }
}(ApplicationConfiguration));

angular.module(ApplicationConfiguration.applicationModuleName)
    .run(['$rootScope', '$state', 'Authentication',
        function ($rootScope, $state, Authentication) {

            'use strict';

            // Check authentication before changing state
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
                    var allowed = false;
                    if ((Authentication.user.roles !== undefined && Authentication.user.roles.indexOf('superuser') !== -1)) {
                        allowed = true;
                    } else {
                        toState.data.roles.forEach(function (role) {
                            if ((Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1)) {
                                allowed = true;
                                return true;
                            }
                        });
                    }

                    if (!allowed) {
                        event.preventDefault();
                        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
                            $state.go('forbidden');
                        } else {
                            $state.go('authentication.signin').then(function () {
                                storePreviousState(toState, toParams);
                            });
                        }
                    }
                }
            });

            // Record previous state
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                storePreviousState(fromState, fromParams);
                if (!toState.data) return;
                $rootScope.currentTitle = '- ' + toState.data.pageTitle + ' -';
            });

            // Store previous state

            function storePreviousState(state, params) {
                // only store this state if it shouldn't be ignored
                if (!state.data || !state.data.ignoreState) {
                    $state.previous = {
                        state: state,
                        params: params,
                        href: $state.href(state, params)
                    };
                }
            }
        }
    ]);
