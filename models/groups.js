'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Groups.belongsToMany(models.User, {
        through: models.GroupUsers,
        onDelete: "cascade",
        foreignKey: {
          name: "group_id",
          allowNull: false,
        },
        as: "user",

      });

    }
  }
  Groups.init({
    group_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Groups',
  });
  return Groups;
};
