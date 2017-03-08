'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    express = require('express'),
    morgan = require('morgan'),
    logger = require('./logger'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    favicon = require('serve-favicon'),
    responseTime = require('response-time'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    helmet = require('helmet'),
    passport = require('passport'),
    flash = require('connect-flash'),
    consolidate = require('consolidate'),
    _ = require('lodash'),
    xmlparser = require('express-xml-bodyparser'),
    expressValidator = require('express-validator'),
    path = require('path'),
    csrf = require('csurf'),
    expressWinston = require('express-winston'),
    lusca = require('lusca'),
    authHelper = require(path.resolve('./config/helper/auth')),
    responseHandler = require(path.resolve('./config/helper/responseHelper'));


/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
    var vars = config.app;

    // Set environment
    app.set('env', config.env);

    // Setting application local variables
    app.locals.title = config.app.title;
    console.log('app.locals.title is ' + app.locals.title);
    app.locals.description = config.app.description;
    if (config.secure && config.secure.ssl === true) {
        app.locals.secure = config.secure.ssl;
    }
    app.locals.keywords = config.app.keywords;
    app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
    app.locals.jsLibFiles = config.files.client.lib.js;
    app.locals.cssLibFiles = config.files.client.lib.css;
    app.locals.jsAPPFiles = config.files.client.app.js;
    app.locals.cssAPPFiles = config.files.client.app.css;
    app.locals.livereload = config.livereload;

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.host = req.protocol + '://' + req.hostname;
        res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
        next();
    });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {

    // Initialize favicon middleware
    app.use(favicon(path.resolve(config.favicon)));

    // Showing response time
    app.use(responseTime());


    if (process.env.NODE_ENV === 'production') {

        config.info('================> Applying Production Configurations');

        // Enable etag for better performance
        app.enable('etag');

        app.use(compress({
            filter: function (req, res) {
                return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
            },
            level: 9
        }));

        // Setting the app router and static folder
        app.use('/', express.static(path.resolve('./public'), {
            maxAge: 86400000 /* one day*/
        }));

        app.use('/upload', express.static(path.resolve('./upload')));

        // Standard Apache combined log output.
        app.use(morgan('combined'));

        // Enable memory cache
        app.locals.cache = 'memory';

    } else {

        config.info('================> Applying Development Configurations');

        // Showing stack errors
        app.set('showStackError', true);

        app.use('/', express.static(path.resolve('./public')));

        app.use('/upload', express.static(path.resolve('./upload')));

        // Enable logger (morgan)
        if (app.get('env') !== 'test') app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    }


    // Enable jsonp
    app.enable('jsonp callback');

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(expressValidator([]));
    app.use(methodOverride());
    app.use(xmlparser());
    app.use(cookieParser());

    // Enable jsonp
    app.enable('jsonp callback');

    // connect flash for flash messages
    app.use(flash());

};

/**
 * Configure Express session
 */
module.exports.initCookieSession = function (app, db) {
    // CookieParser should be above session
    app.use(cookieParser(config.SECURITY_COOKIE_SECRET));

    // Cookie session storage
    //app.use(cookieSession({ //todo old delete
    //  name: config.SECURITY_SESSION_KEY,
    //  secret: config.SECURITY_SESSION_SECRET
    //}));
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './');
    //app.set('views', path.join(__dirname, '../app/views')); // todo all?
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app, db) {
    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        cookie: {
            maxAge: config.sessionCookie.maxAge,
            httpOnly: config.sessionCookie.httpOnly,
            secure: config.sessionCookie.secure && config.secure.ssl
        },
        key: config.sessionKey,
        store: new MongoStore({
            mongooseConnection: db.connection,
            collection: config.sessionCollection
        })
    }));

    // Add Lusca CSRF Middleware
    // app.use(lusca(config.csrf));  // no config.csrf, so will not work... @tom
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app, db) {
    config.files.server.configs.forEach(function (configPath) {
        require(path.resolve(configPath))(app, db);
    });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
    // Use helmet to secure Express headers
    var SIX_MONTHS = 15778476000;
    // app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.use(helmet.hsts({
        maxAge: SIX_MONTHS,
        includeSubdomains: true,
        force: true
    }));
    app.disable('x-powered-by'); // todo new  what to do

    app.use(helmet.hidePoweredBy({setTo: 'http://www.erealmsoft.com'})); //todo old copyright?
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function (app) {

    // Globbing static routing
    config.folders.client.forEach(function (staticPath) {
        app.use(staticPath, express.static(path.resolve('./' + staticPath)));
    });
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
    // Globbing policy files
    authHelper.init();
};


/**
 * Configure the public API routes
 */
module.exports.initPublicAPIRoutes = function (app) {

    // Globbing API routing
    config.files.server.APIRoutes.forEach(function (APIRoutePath) {
        app.use('/api/base', require(path.resolve(APIRoutePath)));
    });

};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
    app.use(function (req, res, next) {
        config.info('Request: ', req.originalUrl);
        next();
    });
    // if (app.get('env') !== 'test') {
    //     app.use(csrf());

    //     app.use(function (req, res, next) {
    //         res.locals.csrf_token = req.csrfToken();
    //         next();
    //     });
    // }
    // Globbing routing files
    config.files.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
    // express-winston errorLogger makes sense AFTER the router.
    app.use(expressWinston.errorLogger(config.logger));

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {

        // If the error object doesn't exists, treat as 404
        if (!err) {
            return next();
        }

        if (req.xhr || req.isAPI || (config.env === 'test')) {
            if (err.name === 'MongoError') {
                return res.send(responseHandler.getMongoErrorMessage(err));
            } else {
                return res.send(responseHandler.getResponseData({code: '500'}));
            }
        } else {
            // Error page
            return res.status(500).render('modules/core/server/views/500', {
                error: 'The server is currently unavailable.'
            });
        }
    });
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
    // Initialize express app
    var app = express();

    // Initialize local variables
    this.initLocalVariables(app);

    // Initialize Express middleware
    this.initMiddleware(app);

    // Initialize Express view engine
    this.initViewEngine(app);

    // Initialize Express session
    this.initSession(app, db);

    // Initialize Modules configuration
    this.initModulesConfiguration(app);

    // Initialize Helmet security headers
    this.initHelmetHeaders(app);

    // Initialize modules static client routes
    this.initModulesClientRoutes(app);

    // Initialize modules server authorization policies
    this.initModulesServerPolicies(app);

    // Initialize public API routes
    this.initPublicAPIRoutes(app);

    // Initialize modules server routes
    this.initModulesServerRoutes(app);

    // Initialize error routes
    this.initErrorRoutes(app);

    return app;
};
