'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/angular/angular-csp.css',
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/Bootflat/bootflat/css/bootflat.min.css',
                'public/lib/angular-bootstrap/ui-bootstrap-csp.css',
                'public/lib/font-awesome/css/font-awesome.min.css',
                'public/lib/ng-sortable/dist/ng-sortable.min.css',
                'public/lib/textAngular/dist/textAngular.css'
            ],
            js: [
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/ng-sortable/dist/ng-sortable.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/ng-flow/dist/ng-flow-standalone.min.js'
            ],
            tests: ['public/lib/angular-mocks/angular-mocks.js']
        },
        css: [
            'public/css/main*.css',
            'modules/*/client/css/*.css'
        ],
        less: [
            'public/less/main.less',
            'modules/*/client/less/*.less'
        ],
        js: [
            'modules/core/client/app/config.js',
            'modules/core/client/app/init.js',
            'modules/*/client/*.js',
            'modules/*/client/**/*.js'
        ],
        views: ['modules/*/client/views/**/*.html'],
        templates: ['build/templates.js']
    },
    server: {
        gruntConfig: 'gruntfile.js',
        allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
        models: 'modules/*/server/models/**/*.js',
        routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
        APIRoutes: ['modules/core/server/apiRoutes/**/*.js', 'modules/!(core)/server/apiRoutes/**/*.js'],
        cronJobs: 'modules/*/server/cronJobs/**/*.js',
        config: 'modules/*/server/config/*.js',
        policies: 'modules/*/server/policies/*.js',
        views: 'modules/*/server/views/*.html'
    }
};
