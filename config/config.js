'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    winston = require('winston');

////todo new meanjs how to relate .env
module.exports = _.extend(require('../config/env/default'), require('../config/env/' + (process.env.NODE_ENV || 'development')));

/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function (globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function (file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            if (excludes.hasOwnProperty(i)) {
                                file = file.replace(excludes[i], '');
                            }
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};

/**
 * Validate NODE_ENV existence
 */
var validateEnvironmentVariable = function () {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    }
    // Reset console color
    console.log(chalk.white(''));
};

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
var validateSecureMode = function (config) {

    if (!config.secure || config.secure.ssl !== true) {
        return true;
    }

    var privateKey = fs.existsSync(path.resolve(config.secure.privateKey));
    var certificate = fs.existsSync(path.resolve(config.secure.certificate));

    if (!privateKey || !certificate) {
        console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
        console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh\n'));
        config.secure.ssl = false;
    }
};

/**
 * Validate Session Secret parameter is not set to default in production
 */
var validateSessionSecret = function (config, testing) {

    if (process.env.NODE_ENV !== 'production') {
        return true;
    }

    if (config.sessionSecret === 'MEAN') {
        if (!testing) {
            console.log(chalk.red('+ WARNING: It is strongly recommended that you change sessionSecret config while running in production!'));
            console.log(chalk.red('  Please add `sessionSecret: process.env.SESSION_SECRET || \'super amazing secret\'` to '));
            console.log(chalk.red('  `config/env/production.js` or `config/env/local.js`\n'));
        }
        return false;
    } else {
        return true;
    }
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFolders = function (config, assets) {
    // Appending files
    config.folders = {
        server: {},
        client: {}
    };

    // Setting globbed client paths
    config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'modules/*/client/'), process.cwd().replace(new RegExp(/\\/g), '/'));
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function (config, assets) {
    // Appending files
    config.files = {
        server: {},
        client: {lib: {}, app: {}},
        api: {}
    };

    // Setting Globbed model files
    config.files.server.models = getGlobbedPaths(assets.server.models);

    // Setting Globbed API route files
    config.files.server.APIRoutes = getGlobbedPaths(assets.server.APIRoutes);

    // Setting Globbed route files
    config.files.server.routes = getGlobbedPaths(assets.server.routes);

    // Setting Globbed config files
    config.files.server.configs = getGlobbedPaths(assets.server.config);

    // Setting Globbed cronJob files
    config.files.server.cronJobs = getGlobbedPaths(assets.server.cronJobs);

    // Setting Globbed policies files
    config.files.server.policies = getGlobbedPaths(assets.server.policies);

    // Setting Globbed js files
    config.files.client.lib.js = getGlobbedPaths(assets.client.lib.js, 'public/');
    config.files.client.app.js = getGlobbedPaths(assets.client.js, ['public/']);

    // Setting Globbed css files
    config.files.client.lib.css = getGlobbedPaths(assets.client.lib.css, 'public/');
    config.files.client.app.css = getGlobbedPaths(assets.client.css, ['public/']);

    // Setting Globbed test files
    config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

var initLoggerConfig = function (config) {
    /**
     * Create logger
     */
    var logger = new (winston.Logger)(config.logger);

    config.log = function () {
        logger.log(arguments);
    };

    config.info = function () {
        logger.info(arguments);
    };

    config.error = function () {
        logger.error(arguments);
    };

    config.debug = function () {
        logger.debug(arguments);
    };
};
/**
 * Initialize global configuration
 */
var initGlobalConfig = function () {
    // Validate NODE_ENV existence
    validateEnvironmentVariable();

    var assetsConfigFile = 'config/assets/default';
    if (process.env.NODE_ENV === 'production') {
        assetsConfigFile = 'config/assets/production';
    }
    
    // Merge assets
    var assets = require(path.join(process.cwd(), assetsConfigFile));

    // Get the default config
    var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    var config = _.merge(defaultConfig, environmentConfig);

    // read package.json for MEAN.JS project information
    var pkg = require(path.resolve('./package.json'));
    config.meanjs = pkg;

    // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
    config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js')) && require(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js'))) || {});

    // Initialize global globbed files
    initGlobalConfigFiles(config, assets);

    // Initialize global globbed folders
    initGlobalConfigFolders(config, assets);

    // Validate Secure SSL mode can be used
    validateSecureMode(config);

    // Validate session secret
    validateSessionSecret(config);

    // Initialize logger functions.
    initLoggerConfig(config);

    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths,
        validateSessionSecret: validateSessionSecret
    };

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
