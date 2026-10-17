'use strict';

const { VERIFICATION_STATUS } = require('../constants/authConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.TEXT,
      },
      website: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      verification_status: {
        type: Sequelize.ENUM(...Object.values(VERIFICATION_STATUS)),
        allowNull: false,
        defaultValue: VERIFICATION_STATUS.UNVERIFIED,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_companies_verification_status";');
  }
};
