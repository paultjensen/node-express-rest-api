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
        return Promise.all(createModelTasks).then(() => {
            return 'success';
        }).catch((error) => {
            Logger.log.error(error);
            throw error;
        });
    };

    db.createUser = function(dbConn, userData) {
        return (bcrypt.hash(userData.password, _config.bcrypt_rounds)).then((hashedPassword) => {
            userData.password = hashedPassword;
            return dbConn.User.create(userData, {
                fields: ['username', 'password', 'email']
            }).then((result) => {
                return result;
            }).catch((error) => {
                Logger.log.error(error);
            });
        });
    };

    db.getUsers = function(dbConn, params) {
        let queryAttributes = {
            attributes: {exclude: ['password']},
            limit: params.pageSize,
            offset: params.pageOffset
        };

        let orderBy = [];
        if (params.orderParam.length > 0) {
            orderBy.push(params.orderParam);
            if (params.orderDirection.length > 0) {
                orderBy.push(params.orderDirection);
            }
            queryAttributes.order = [orderBy];
        }

        if (params.search.length > 0) {
            queryAttributes.where = {
                $or: [
                    {'username': {$ilike: '%' + params.search + '%'}},
                    {'email': {$ilike: '%' + params.search + '%'}}
                ]
            };
        }

        return dbConn.User.findAndCountAll(queryAttributes).then((result) => {
            return result;
        }).catch((error) => {
            Logger.log.error(error);
        });
    };

    db.getUser = function(dbConn, params) {

        return dbConn.User.findOne({
            where: {
                id: params.userId
            },
            attributes: {exclude: ['password']}
        }).catch((error) => {
            Logger.log.error(error);
        });
    };

    db.deleteUser = function(dbConn, params) {

        return dbConn.User.destroy({
            where: {
                id: params.userId
            }
        }).catch((error) => {
            Logger.log.error(error);
        });
    };

    db.modifyUser = function(dbConn, params) {

        return dbConn.User.update(
            params.update,
            {
                where: {
                    id: params.userId
            }
        }).catch((error) => {
            Logger.log.error(error);
        });
    };

    module.exports = {db: db};
})();