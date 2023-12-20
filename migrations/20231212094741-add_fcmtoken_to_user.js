'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('Users', 'fcmtoken', {
      type: Sequelize.STRING,
        before: 'createdAt'
    });
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.removeColumn('Users', 'fcmtoken');
  }
};
