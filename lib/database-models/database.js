var async = require('async');
var fileToClass = {
    'User': 'users'
};

module.exports.createModels = function (sequelize) {
    return new Promise(function (resolve, reject) {
        async.each(Object.keys(fileToClass), function (modName, done) {
            try {
                sequelize[modName] = sequelize.import(__dirname + '/' + fileToClass[modName]);
                done();
            }
            catch (error) {
                done(error);
            }

        }, function (err) {
            if (err) {
                reject(err);
            }
            resolve(sequelize);
        });
    });
};