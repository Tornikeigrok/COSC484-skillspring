'use strict';

const { PROPOSAL_STATUS } = require('../constants/proposalConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proposals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tasks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      approach: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      proposed_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      questions: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM(...Object.values(PROPOSAL_STATUS)),
        allowNull: false,
        defaultValue: PROPOSAL_STATUS.PENDING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
    await queryInterface.addConstraint('proposals', {
      fields: ['task_id', 'student_id'],
      type: 'unique',
      name: 'proposals_task_id_student_id_unique',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('proposals');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_proposals_status";');
  }
};
