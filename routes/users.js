let Express = require('express');
let Router = Express.Router();
let DbConn = require('../lib/database-connections').db;
let DbLib = require('../lib/database').db;
let Logger = require('../lib/logger');
let FormatterLib = require('../lib/formatter').formatter;
let Util = require('../lib/util');

/* POST create user. */
Router.post('/', function (req, res) {

    let dbInst = DbConn.getConnection();

    DbLib.createUser(dbInst, req.body).then(function (result) {
        res.status(200).json(result);
    }).catch(function (err) {
        Logger.log.error('error:', err);
        res.status(500).json({error: err});
    });
});

/* GET users listing. */
Router.get('/', function(req, res) {
    let dbInst = DbConn.getConnection();
    let params = {};
    params.pageSize = Util.helper.getLimitParam(req.query);
    params.pageOffset = Util.helper.getOffsetParam(req.query);
    params.orderDirection = Util.helper.getOrderDirection(req.query);
    params.orderParam = Util.helper.getOrderParam(req.query,['username', 'email']);
    params.search = Util.helper.getSearchParam(req.query);

    if (isNaN(params.pageSize) || isNaN(params.pageOffset) ||
        params.orderDirection === null || params.orderParam === null) {
        res.status(400).json({error: 'invalid query parameters'});
        return;
    }

    DbLib.getUsers(dbInst, params).then(function (result) {
        res.status(200).json(FormatterLib.format(FormatterLib.usersFormatter, result));
    }).catch(function (err) {
        Logger.log.error('error:', err);
        res.status(500).json({error: err});
    });
});

module.exports = Router;
