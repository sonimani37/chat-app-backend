'use strict';
const { Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {

        static associate(models) {

            User.belongsToMany(models.Groups, {
                through: models.GroupUsers,
                onDelete: "cascade",
                foreignKey: { name: "user_id", allowNull: false, }, as: "group",
            });

            User.hasOne(models.UserImage, { foreignKey: 'userId', as: 'UserImages' });
        }
    }
    User.init({
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        contact: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        status: {
            type: DataTypes.STRING, // or DataTypes.BOOLEAN
            defaultValue: 'offline',
        },
        otp: DataTypes.INTEGER,
        resetToken: DataTypes.STRING,
        fcmtoken: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};
