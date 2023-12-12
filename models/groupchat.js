'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupChat.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
      
      GroupChat.belongsTo(models.Groups, { foreignKey: 'groupId', as: 'group' });
    }
  }
  GroupChat.init({
    message: DataTypes.STRING,
    groupId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupChat',
  });
  return GroupChat;
};