let Express = require('express');
let Router = Express.Router();
let DbConn = require('../lib/database-connections').db;
let DbLib = require('../lib/database').db;

/* POST create user. */
Router.post('/', function (req, res) {

    let dbInst = DbConn.getConnection();

    DbLib.createUser(dbInst, req.body).then(function (result) {
        res.status(200).json(result);
    }).catch(function (err) {
        console.log('error:', err);
        res.status(500).json({success: false, error: err});
    });
});

/* GET users listing. */
Router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = Router;
