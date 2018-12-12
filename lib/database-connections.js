/*
* Functions to handle getting database connections.
* Supports single and sharded database instances
 */
(function() {
    'use strict';
    let Sequelize = require('sequelize');
    let db = {};
    let dbConns = null;

    /*  Initialization will create an active connection for each database shard.
     *  It will also create a map of all shard identifiers to shards
     * @returns {Promise}
     * @private
     */
    db.init = function(config) {
        return new Promise(function (resolve, reject) {

            // Close previously opened connections, if any
            _close();

            _initConnections(config)
                .then(function (newDbConns) {
                    if (!newDbConns.connections) {
                        dbConns = {
                            shardMap: null,
                            connections: {'core': newDbConns}
                        };
                    } else {
                        dbConns = newDbConns;
                    }
                    resolve('success');
                })
                .catch(reject);
        });
    };

    let _initConnections = function (config) {

        let shardConfigs = config.database.shards;
        let shardConnectionTasks = [];
        for (let shardKey in shardConfigs) {
            if (shardConfigs.hasOwnProperty(shardKey)) {
                shardConnectionTasks.push(_getConnection(shardKey, shardConfigs[shardKey]));
            }
        }

        let requestedShards = {'core': null};

        //Get connections to all shards
        return Promise.all(shardConnectionTasks).then(function (shardConns) {
            for (let i = 0; i < shardConns.length; i++) {
                requestedShards[shardConns[i].name] = shardConns[i].connection;
            }

            return {
                connections: requestedShards
            };

        }).catch(function (error) {
            console.log(error);
            throw error;
        });

    };

    let _getConnection = function (shardName, shardConfig) {
        try {
            console.log('Connecting to: ' + shardConfig.server);
            console.log('Port: ' + shardConfig.port);
            console.log('Dialect: ' + shardConfig.dialect);
            console.log('Database: ' + shardConfig.database);
            let db = new Sequelize(shardConfig.dialect + '://' + shardConfig.username + ':' +
                shardConfig.password + '@' + shardConfig.server + ':' + shardConfig.port +
                '/' + shardConfig.database,
                {
                    timezone: '+00:00',
                    logging: false
                    // Use this next line to print out SQL to the console
                    //logging: console.log
                }
            );
            // return Database.createModels(db).then(function () {
            //     return {
            //         name: shardName,
            //         connection: db
            //     };
            // }).catch(function (error) {
            //     console.log(error);
            //     throw error;
            // });
            return {
                name: shardName,
                connection: db
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    /*Function to return hash off all connections (conn by shard name)
     * @returns {dbConns.connections|{core}}
     */
    db.getConnection = function(shardIdentifier) {
        if (dbConns.shardMap && dbConns.connections &&
            typeof(shardIdentifier) !== 'undefined' && shardIdentifier !== null && shardIdentifier.length > 0 ) {
            shardIdentifier = shardIdentifier.trim();
            let dbConn = dbConns.connections[dbConns.shardMap[shardIdentifier]];
            if (typeof(dbConn) !== 'undefined') {
                return dbConn;
            } else{
                return dbConns.connections.core;
            }
        } else {
            return dbConns.connections.core;
        }
    };

    /*Function to return hash off all connections (connection by shard name)
     * @returns {dbConns.connections|{core}}
     */
    db.getAllConnections = function () {
        return dbConns.connections;
    };

    /* Function to close all connections
     */
    let _close = function () {
        if ( dbConns && _.has( dbConns,'connections') && dbConns.connections.length ){
            _.forEach(dbConns.connections, function(conn){
                conn.close();
            });
            dbConns = null;
        }
    };

    module.exports = {db: db};
})();