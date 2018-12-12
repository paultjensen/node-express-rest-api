/*global describe*/
/*global before*/
(function() {
    'use strict';

    process.env.NODE_ENV = 'test';

    let Chai = require('chai');
    let expect = Chai.expect;

    let App = null;
    let APIKey = null;

    let Test = require('supertest');
    let TestLib = require('./test-lib');

    let checkIsUser = function (user) {
        expect(user).to.be.an('object');
        expect(user).to.contain.all.keys('id', 'username', 'email', 'created_at', 'last_login', 'updated_at');
    };

    describe("API Users, roles, and permissions tests", function() {

        before(function (done) {
            let Svc = require('../app');
            Svc.svc.init()
                .then(function() {
                    App = Svc.app;
                    TestLib.getApiKey(Test, App).then(function(apiKey) {
                        APIKey = apiKey;
                        done();
                    }).catch(function(err) {
                        console.log(err);
                        done();
                    });
                }).catch(function(err) {
                console.log(err);
                done();
            });

        });

        describe("Get users", function () {
            it("should return an array", function (done) {
                Test(App).get('/v1/users/')
                    .set('x-project-jwt', APIKey)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .expect(function (res) {
                        expect(res.body.data.rows).to.be.an('array');
                        expect(res.body.data.count).to.be.eq(2);
                        checkIsUser(res.body.data.rows[0]);
                    })
                    .end(done);
            });
        });

        describe("Get user", function () {
            it("should return an object", function (done) {
                Test(App).get('/v1/users/1')
                    .set('x-project-jwt', APIKey)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .expect(function (res) {
                        expect(res.body.data).to.be.an('object');
                        checkIsUser(res.body.data);
                    })
                    .end(done);
            });
        });


    });
})();