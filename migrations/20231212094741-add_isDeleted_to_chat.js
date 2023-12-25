'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Chats', 'isDeleted', {
            type: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Chats', 'isDeleted');
    }
};
