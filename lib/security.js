(function() {
    'use strict';

    let jwt = require('jsonwebtoken');
    let LocalStrategy = require('passport-local').Strategy;
    let JwtStrategy = require('passport-jwt').Strategy;
    let HeaderExtractor = require('passport-jwt').ExtractJwt.fromHeader('x-project-jwt');
    let JwtExtractor = require('passport-jwt').ExtractJwt.fromExtractors([HeaderExtractor]);

    let security = {};
    let _config = null;

    security.init = function(app, passport, dbConnection, dbLib, config) {
        _config = config;
        let jwtSecretKey = config.jwtSecretKey;

        // JSON Web Token strategy. Used for Main APIs after login
        passport.use(new JwtStrategy({
            secretOrKey: jwtSecretKey ,
            jwtFromRequest: JwtExtractor
        }, function (payload, done) {
            done(null, payload);
        }));

        app.use(passport.initialize());

        passport.use(new LocalStrategy({
                session: false,
                usernameField: 'username'
            },
            function (username, password, done) {
                _authenticateUser(dbConnection.getConnection(), username, password).then(function (results) {
                    if (!results) {
                        done(null, false);
                        return;
                    }

                    let tokenResults = {
                        id: results.id,
                        username: results.username
                    };

                    let token = jwt.sign(tokenResults, jwtSecretKey);

                    done(null, {
                        token: token,
                        user: results
                    });

                }).catch(function (err) {
                    done(err, false);
                });
            }
        ));
    };

    let _authenticateUser = function(dbConn, username, passwordPlainText) {
        let query = 'select username, password, email from users where users.username=$username';
        return dbConn.query(query,{bind: {username: username}, type: dbConn.QueryTypes.SELECT}).then(function(result) {
            if (!result.length) {
                return null;
            }
            return result;
        });

        // return new Promise(function(resolve, reject) {
        //     resolve('success');
        // });
    };

    module.exports = {security: security};
})();