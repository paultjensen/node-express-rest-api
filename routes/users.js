let Express = require('express');
let Router = Express.Router();
let DbConn = require('../lib/database-connections').db;
let DbLib = require('../lib/database').db;
let Logger = require('../lib/logger');
let FormatterLib = require('../lib/formatter').formatter;
let Util = require('../lib/util');

let _validateUserId = function(userId) {
    return !isNaN(userId);
};

/* POST create user. */
Router.post('/', function (req, res) {
    let config = req.app.get('config');
    let dbInst = DbConn.getConnection();

    DbLib.createUser(dbInst, req.body).then(function (result) {
        res.status(200).json(result);
    }).catch(function (err) {
        Logger.log.error(config.msg.ERROR, err);
        res.status(500).json({error: err});
    });
});

/* GET users listing. */
Router.get('/', function(req, res) {
    let config = req.app.get('config');
    let cache = req.app.get('cache');
    let dbInst = DbConn.getConnection();
    let params = {};
    params.pageSize = Util.helper.getLimitParam(req.query);
    params.pageOffset = Util.helper.getOffsetParam(req.query);
    params.orderDirection = Util.helper.getOrderDirection(req.query);
    params.orderParam = Util.helper.getOrderParam(req.query,['username', 'email']);
    params.search = Util.helper.getSearchParam(req.query);

    if (isNaN(params.pageSize) || isNaN(params.pageOffset) ||
        params.orderDirection === null || params.orderParam === null) {
        res.status(400).json({error: config.msg.INVALID_PARAMS});
        return;
    }

    let cacheKey = 'getUsers-' + params.pageSize + '-' + params.pageOffset + '-' + params.orderDirection +
    '-' + params.orderParam + '-' + params.search;

    cache.getKeyValJson(cacheKey).then(function(cachedResult) {
        if (cachedResult) {
            res.status(200).send(cachedResult);
        } else {
            DbLib.getUsers(dbInst, params).then(function (result) {
                let formattedResult = FormatterLib.format(FormatterLib.usersFormatter, result);
                res.status(200).json(formattedResult);
                cache.writeKeyToCache(cacheKey, JSON.stringify(formattedResult), config.cache.expire);
            }).catch(function (err) {
                Logger.log.error(config.msg.ERROR, err);
                res.status(500).json({error: err});
            });
        }
    }).catch(function(err) {
        Logger.log.error(config.msg.ERROR, err);
        res.status(500).json({error: err});
    });
});

Router.get('/:userId', function (req, res) {
    let config = req.app.get('config');
    let dbInst = DbConn.getConnection();
    let params = {};
    params.userId = parseInt(req.params.userId);

    if (!_validateUserId(params.userId)) {
        res.status(400).json({error: config.msg.INVALID_PARAMS});
        return;
    }

    DbLib.getUser(dbInst, params).then(function (result) {
        if (!result) {
            res.status(404).end();
            return;
        }
        res.status(200).json(FormatterLib.format(FormatterLib.userFormatter, result));
    }).catch(function (err) {
        Logger.log.error(config.msg.ERROR, err);
        res.status(500).json({error: err});
    });

});

Router.delete('/:userId/', function (req, res) {
    let config = req.app.get('config');
    let dbInst = DbConn.getConnection();
    let params = {};
    params.userId = parseInt(req.params.userId);

    if (!_validateUserId(params.userId)) {
        res.status(400).json({error: config.msg.INVALID_PARAMS});
        return;
    }

    DbLib.deleteUser(dbInst, params).then(function (result) {
        if (result && result > 0) {
            res.status(200).json({result: config.msg.SUCCESS});
            return;
        }
        res.status(404).end();
    }).catch(function (err) {
        Logger.log.error(config.msg.ERROR, err);
        res.status(500).json({error: err});
    });
});

Router.put('/:userId/', function (req, res) {
    let config = req.app.get('config');
    let dbInst = DbConn.getConnection();
    let params = {};

    params.update = req.body;
    params.userId = parseInt(req.params.userId);

    if (!_validateUserId(params.userId)) {
        res.status(400).json({error: config.msg.INVALID_PARAMS});
        return;
    }

    DbLib.modifyUser(dbInst, params).then(function (result) {
        if (result && result > 0) {
            res.status(200).json({result: config.msg.SUCCESS});
        }
        res.status(404).end();
    }).catch(function (err) {
        Logger.log.error(config.msg.ERROR, err);
        res.status(500).json({error: err});
    });
});

module.exports = Router;
