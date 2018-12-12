(function() {
    'use strict';

    module.exports.getApiKey = function (Test, App) {
        return new Promise(function(resolve) {
            Test(App).post('/v1/login')
                .send({
                    username: 'testa',
                    password: 'password'
                })
                .expect('Content-Type', /json/)
                .expect(function (res) {
                    expect(res.body.token).to.be.a('string');
                }).end(function(error, res) {
                resolve(res.body.token);
            });
        });
    };

})();