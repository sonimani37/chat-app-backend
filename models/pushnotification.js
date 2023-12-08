'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PushNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PushNotification.init({
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    isSent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PushNotification',
  });
  return PushNotification;
};