(function() {
    'use strict';
    let Database = require('./database-models/database');
    let db = {};

    db.init = function(dbConns) {
        let createModeltasks = [];
        for (let conn in dbConns) {
            if (dbConns.hasOwnProperty(conn)) {
                createModeltasks.push(Database.createModels(dbConns[conn]));
            }
        }
        return Promise.all(createModeltasks).then(function () {
            return 'success';
        }).catch(function (error) {
            console.log(error);
            throw error;
        });
    };

    module.exports = {db: db};
})();