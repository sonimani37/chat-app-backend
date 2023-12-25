'use strict';
const { Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Chat extends Model {
        static associate(models) {
            // define association here
            Chat.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
            Chat.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
        }
    }
    Chat.init({
        message: DataTypes.STRING,
        senderId: DataTypes.INTEGER,
        receiverId: DataTypes.INTEGER,
        isDeleted: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Chat',
    });
    return Chat;
};