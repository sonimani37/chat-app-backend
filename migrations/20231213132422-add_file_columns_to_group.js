'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Groups', 'fileType', {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn('Groups', 'fileName', {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn('Groups', 'filePath', {
            type: Sequelize.STRING,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Groups', 'fileType');
        await queryInterface.removeColumn('Groups', 'fileName');
        await queryInterface.removeColumn('Groups', 'filePath');
    }
};
