'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TYPE "enum_tasks_status" ADD VALUE IF NOT EXISTS 'in_review';`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_tasks_status" ADD VALUE IF NOT EXISTS 'rejected';`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_tasks_status" ADD VALUE IF NOT EXISTS 'escalated';`);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Postgres cannot drop a single enum value
     */
  }
};
