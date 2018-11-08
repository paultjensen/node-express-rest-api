(function() {
    'use strict';

    let bcrypt = require('bcrypt');
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
        let loginUser = null;
        let loginUserDataValues = null;
        let lastLogin = null;
        // noinspection JSCheckFunctionSignatures
        return dbConn.User.findOne({
            where: {
                username: username
            }
        }).then(function(user) {
            if (!user) {
                return null;
            }
            loginUser = user;
            return bcrypt.compare(passwordPlainText, user.password);
        }).then(function(match) {
            if (!match) {
                return null;
            }
            lastLogin = loginUser.dataValues.last_login;
            return loginUser.update({
                last_login: new Date().getTime()
            });
        }).then(function() {
            loginUserDataValues = loginUser.dataValues;
            delete loginUserDataValues.password;
            loginUserDataValues.last_login = lastLogin;
            return loginUserDataValues;
        });
    };

    module.exports = {security: security};
})();