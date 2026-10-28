'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'skills', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'skills');
  }
};
