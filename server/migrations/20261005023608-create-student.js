'use strict';

const { VERIFICATION_STATUS } = require('../constants/authConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
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
      bio: {
        type: Sequelize.TEXT,
      },
      github_url: {
        type: Sequelize.TEXT,
      },
      university: {
        type: Sequelize.TEXT,
      },
      graduation_year: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('students');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_verification_status";');
  }
};
