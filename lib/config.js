(function() {
    'use strict';

    let _config = {
        apiVersion: 'v1',
        jwtSecretKey: '8a9sdf67d6s9su',
        bcrypt_rounds: 9,
        "database": {
            "shards": {
                "core": {
                    "server": "localhost",
                    "port": "5432",
                    "username": "admin_user",
                    "password": "password",
                    "dialect": "postgres",
                    "database": "node_express_rest_api",
                    "description": "Contains users, configuration, settings, etc."
                }
            }
        }
    };

    module.exports = {config: _config};
})();