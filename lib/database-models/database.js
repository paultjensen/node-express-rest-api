let async = require('async');
const fileToClass = {
    'User': 'users'
};

module.exports.createModels = function (sequelize) {
    return new Promise((resolve, reject) => {
        async.each(Object.keys(fileToClass),  (modName, done) => {
            try {
                sequelize[modName] = sequelize.import(__dirname + '/' + fileToClass[modName]);
                done();
            }
            catch (error) {
                done(error);
            }

        }, (err) => {
            if (err) {
                reject(err);
            }
            resolve(sequelize);
        });
    });
};