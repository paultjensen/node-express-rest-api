/* formatter.js
 *
 * Purpose: Provides functions to format results.
 * Author: Paul Jensen (paul.t.jensen@gmail.com)
 */

(function() {
    'use strict';

    let formatter = {};

    formatter.format = function(formatterFunc, dataValues) {
        return {

            data: formatterFunc(dataValues)
        };
    };

    formatter.usersFormatter = function(dataValues) {
        let usersData = [];
        for (let i = 0; i < dataValues.length; i++) {
            usersData.push(formatter.userFormatter(dataValues[i]));
        }
        return (dataValues);
    };

    formatter.userFormatter = function(dataValue) {
        delete(dataValue.dataValues.password);
        return (dataValue);
    };

    module.exports = {formatter: formatter};

})();