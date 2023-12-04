'use strict';

/** @type {import('sequelize-cli').Migration} */

const bcrypt = require("bcrypt");

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        var encryptedPassword = await bcrypt.hash("Any!23456", 10);

        await queryInterface.bulkInsert('Users', [
            {
                firstName: 'Jim',
                lastName: 'Hopper',
                email: 'jim123@mailinator.com',
                contact: '8328040523',
                password: encryptedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Jake',
                lastName: 'Sully',
                email: 'jake123@mailinator.com',
                contact: '8328857545',
                password: encryptedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Eric',
                lastName: 'Milbern',
                email: 'eric123@mailinator.com',
                contact: '8342007596',
                password: encryptedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Manisha',
                lastName: 'Soni',
                email: 'manisha.mangoit@gmail.com',
                contact: '7697570957',
                password: encryptedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    }
};
