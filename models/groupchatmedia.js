'use strict';
const { Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class GroupChatMedia extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    GroupChatMedia.init({
        groupChatId: DataTypes.INTEGER,
        fileType: DataTypes.STRING,          
        fileName: DataTypes.STRING,
        filePath: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'GroupChatMedia',
    });
    return GroupChatMedia;
};