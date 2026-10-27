'use strict';

const { TASK_DIFFICULTY, TASK_STATUS, TASK_TYPE } = require('../constants/taskConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      difficulty: {
        type: Sequelize.ENUM(...Object.values(TASK_DIFFICULTY)),
        allowNull: false,
      },
      estimated_hours: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM(...Object.values(TASK_STATUS)),
        allowNull: false,
        defaultValue: TASK_STATUS.OPEN,
      },
      task_type: {
        type: Sequelize.ENUM(...Object.values(TASK_TYPE)),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_difficulty";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_task_type";');
  }
};
