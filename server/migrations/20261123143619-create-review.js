'use strict';

const { REVIEW_VERDICT } = require('../constants/reviewConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'submissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      status: {
        type: Sequelize.ENUM(...Object.values(REVIEW_VERDICT)),
      },
      functionality: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      quality: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      documentation: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      communication: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      reviewed_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_status";');
  }
};
