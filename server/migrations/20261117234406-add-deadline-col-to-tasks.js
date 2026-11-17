'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'deadline', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date().toISOString(),
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'deadline');
  }
};
