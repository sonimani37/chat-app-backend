'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SingleChatMedia', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            singleChatId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Chats',  // name of the table
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'  // Change the delete rule as needed
            },
            fileType: {
                type: Sequelize.STRING, // 'photo', 'video', 'document', etc.
                allowNull: false,
            },
            fileName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            filePath: {
                type: Sequelize.STRING,
                allowNull: false,
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
        await queryInterface.dropTable('SingleChatMedia');
    }
};