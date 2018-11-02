let Express = require('express');
let Path = require('path');
let CookieParser = require('cookie-parser');
let lessMiddleware = require('less-middleware');
let ExpressLogger = require('morgan');
let Logger = require('./lib/logger');
let Argv = require('yargs').argv;
let Http = require('http');
let Compression = require('compression');
let BodyParser = require('body-parser');

let Router = require('./routes/router');
let OptionsRequestHandler = require('./routes/options');

let app = Express();
let svc = {};

svc.init = function() {
    return new Promise(function(resolve) {
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

        app.use(lessMiddleware(Path.join(__dirname, 'public')));
        app.use(Express.static(Path.join(__dirname, 'public')));

        // Set up response headers
        app.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-nextbus-jwt');
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
        app.use(function (req, res, next) {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // Catch other errors
        app.use(function (err, req, res) {
            res.status(err.status || 500).json({success: false, error: err.message});
        });

        resolve('success');
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
    let addr = svc.server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
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