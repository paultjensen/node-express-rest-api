
var Ping = require('./ping');
var Users = require('./users');

var Express = require('express');
var Router = Express.Router({mergeParams: true});
Router.use('/ping', Ping);
Router.use('/users', Users);

module.exports = Router;