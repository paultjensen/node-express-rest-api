let Express = require('express');
let Router = Express.Router();
let DbConn = require('../lib/database-connections').db;
let DbLib = require('../lib/database').db;
let Logger = require('../lib/logger');
let FormatterLib = require('../lib/formatter').formatter;

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

    DbLib.getUsers(dbInst, req.params).then(function (result) {
        res.status(200).json(FormatterLib.format(FormatterLib.usersFormatter, result));
    }).catch(function (err) {
        Logger.log.error('error:', err);
        res.status(500).json({error: err});
    });
});

module.exports = Router;
