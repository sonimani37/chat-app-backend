'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupChats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Groups',  // name of the table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'  // Change the delete rule as needed
      },
      senderId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',  // name of the table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'  // Change the delete rule as needed
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GroupChats');
  }
};