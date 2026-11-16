'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('proposals', 'nda_signed', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('proposals', 'nda_signed');
  }
};
