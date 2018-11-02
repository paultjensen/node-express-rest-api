/* logger.js
 *
 * Purpose: Provides functions for Logging.
 * Author: Paul Jensen (paul.t.jensen@gmail.com)
 */

(function() {
    'use strict';

    const { createLogger, format, transports } = require('winston');
    const { combine, timestamp, printf, colorize } = format;

    const myFormat = printf(info => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
    });

    const logger = createLogger({
        format: combine(
            colorize(),
            timestamp(),
            myFormat
        ),
        transports: [
            new transports.Console({
                level: 'info',
                handleExceptions: true
            }),
            new transports.Console({
                level: 'error',
                handleExceptions: true
            }),
        ],
        exitOnError: false
    });

    module.exports = {log: logger};
    module.exports.stream = {
        write: function(message){
            logger.info(message);
        }
    };
})();