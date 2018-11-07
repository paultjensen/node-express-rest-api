module.exports.init = function(app, config, Passport) {
    app.post('/' + config.apiVersion + '/login',
        Passport.authenticate('local', { session: false }),
        function(req, res) {
            res.json(req.user);
        });
};