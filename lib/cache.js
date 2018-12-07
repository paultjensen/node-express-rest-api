(function() {
    'use strict';

    let Redis = require('redis');
    let Logger = require('../lib/logger');

    let cache = {};
    let _config = null;
    let _cacheClient = null;

    let _getCacheClient = function() {
        return (Promise).resolve().then(function() {
            if (!_config) {
                throw 'Not initialized. Config is null.';
            }
        }).then(function() {
            Logger.log.debug('Connecting cache : ' + _config.cache.server + ' / ' + _config.cache.port);
            _cacheClient = Redis.createClient(_config.cache.port, _config.cache.server);
            return _cacheClient;
        }).catch(function(error) {
            throw 'Failed to create client: ' + error;
        });
    };

    let _onResponse = function(onSuccess, onError) {
        return function(error, response) {
            if (error) {
                Logger.log.error(error);
                onError(error);
            } else {
                onSuccess(response);
            }
        };
    };

    cache.init = function(config) {
        _config = config;
    };

    cache.done = function() {
        _cacheClient.quit();
    };

    cache.writeKeyToCache = function(key, keyVal, expireSec) {
        return _getCacheClient().then(function(cacheClient) {
            if (!expireSec) {
                return new Promise(function(resolve, reject) {
                    cacheClient.set(key, keyVal, _onResponse(function() {
                        resolve({result: "success"});
                    }, reject));
                });
            } else {
                return new Promise(function(resolve, reject) {
                    cacheClient.set(key, keyVal, 'EX', expireSec, _onResponse(function() {
                        resolve({result: "success"});
                    }, reject));
                });
            }
        });
    };

    cache.getKeyValJson = function(key) {
        return _getCacheClient().then(function(cacheClient) {
            return new Promise(function(resolve, reject) {
                cacheClient.get(key, _onResponse(function(result) {
                    try {
                        resolve(JSON.parse(result));
                    } catch (e) {
                        reject('Cannot parse key: ' + key + ', value: ' + result);
                    }
                }, reject));
            });
        });
    };

    module.exports = {cache: cache};
})();