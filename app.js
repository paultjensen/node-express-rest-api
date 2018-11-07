let Express = require('express');
let Path = require('path');
let CookieParser = require('cookie-parser');
let ExpressLogger = require('morgan');
let Argv = require('yargs').argv;
let Http = require('http');
let Passport = require('passport');
let Compression = require('compression');
let BodyParser = require('body-parser');

let Logger = require('./lib/logger');
let Security = require('./lib/security').security;
let DbConn = require('./lib/database-connections').db;
let DbLib = require('./lib/database').db;

let Router = require('./routes/router');
let LoginAndRegistrationHandler = require('./routes/login');
let OptionsRequestHandler = require('./routes/options');

let app = Express();
let _config = {
    apiVersion: 'v1',
    jwtSecretKey: '8a9sdf67d6s9su',
    "database": {
        "shards": {
            "core": {
                "server": "localhost",
                "port": "5432",
                "username": "admin_user",
                "password": "password",
                "dialect": "postgres",
                "database": "node_express_rest_api",
                "description": "Contains users, configuration, settings, etc."
            }
        }
    }
};
let svc = {};

svc.init = function() {
    return new Promise(function(resolve) {
        DbConn.init(_config)
            .then(function () {
                return DbLib.init(DbConn.getAllConnections());
            }).then(function () {// Set up and initialize security
            Security.init(app, Passport, DbConn, DbLib, _config);

            // Set up response compression
            app.use(Compression());

            // view engine setup
            app.set('views', Path.join(__dirname, 'views'));
            app.set('view engine', 'pug');

            // Reveal Client IP
            app.set('trust proxy', true);

            // Set up logging
            app.use(ExpressLogger(':date[iso] :remote-addr :remote-user ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" ":user-agent"'));

            app.use(Express.json());
            app.use(Express.urlencoded({ extended: false }));

            // Set up parsers
            app.use(BodyParser.json({limit: '800kb'}));
            app.use(BodyParser.urlencoded({limit: '800kb', extended: true}));
            app.use(CookieParser());

            // Handle Static File Requests -- needed for Swagger Docs
            app.use(Express.static(Path.join(__dirname, 'public')));

            // Login and registration requests -- no authentication needed
            LoginAndRegistrationHandler.init(app, _config, Passport);

            // Set up response headers
            app.use(function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-project-jwt');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.setHeader('Expires', '-1');
                res.setHeader('Pragma', 'no-cache');
                next();
            });

            // OPTIONS request needed for CORS
            OptionsRequestHandler.init(app);

            // Static file requests -- for Swagger docs
            app.use(Express.static(Path.join(__dirname, 'public')));

            //Ignore favicon requests
            app.use(ignoreFavicon);

            //Latest version routes
            app.use('/v1/',
                function (req, res, next) {
                    next();
                },
                Router);

            // Catch 404 and forward to error handler
            app.use(function (req, res) {
                res.status(404);
                res.send('404: not found');
            });

            // Catch other errors
            app.use(function (err, req, res) {
                res.status(err.status || 500).json({success: false, error: err.message});
            });

            resolve('success');
        });
    });
};

function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({nope: true});
    } else {
        next();
    }
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    Logger.log.error(error);

    let addr = svc.server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            Logger.log.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            Logger.log.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    let address = svc.server.address();
    let bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
    Logger.log.info('Listening on ' + bind);
}

svc.server = null;

svc.run = function(app) {
    let port = Argv.port || 3000;

    app.set('port', port);

    svc.server = Http.createServer(app);
    svc.server.listen(port);
    svc.server.on('error', onError);
    svc.server.on('listening', onListening);
};

module.exports = {svc: svc, app: app, log: console.log};
