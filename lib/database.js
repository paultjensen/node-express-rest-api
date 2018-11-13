(function() {
    'use strict';
    let bcrypt = require('bcrypt');
    let Logger = require('../lib/logger');
    let Database = require('./database-models/database');
    let db = {};
    let _config = null;

    db.init = function(dbConns, config) {
        _config = config;
        let createModelTasks = [];
        for (let conn in dbConns) {
            if (dbConns.hasOwnProperty(conn)) {
                createModelTasks.push(Database.createModels(dbConns[conn]));
            }
        }
        return Promise.all(createModelTasks).then(function () {
            return 'success';
        }).catch(function (error) {
            Logger.log.error(error);
            throw error;
        });
    };

    db.createUser = function(dbConn, userData) {
        return (bcrypt.hash(userData.password, _config.bcrypt_rounds)).then(function(hashedPassword) {
            userData.password = hashedPassword;
            return dbConn.User.create(userData, {
                fields: ['username', 'password', 'email']
            }).then(function(result) {
                return result;
            }).catch(function(error) {
                Logger.log.error(error);
            });
        });
    };

    db.getUsers = function(dbConn, params) {
        return dbConn.User.findAll({
        }).then(function(result) {
            return result;
        }).catch(function(error) {
            Logger.log.error(error);
        });
    };

    module.exports = {db: db};
})();