/**
 * Users Model for Sequelize
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'users'
    });
};