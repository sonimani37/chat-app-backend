'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserImage.init({
    userId: DataTypes.INTEGER,
    fileType: DataTypes.STRING,
    fileName: DataTypes.STRING,
    filePath: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserImage',
  });
  return UserImage;
};