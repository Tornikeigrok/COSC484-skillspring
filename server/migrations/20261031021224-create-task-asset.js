'use strict';

const { ASSET_TYPE } = require('../constants/taskConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_assets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'tasks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      original_filename: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      stored_filename: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_type: {
        type: Sequelize.ENUM(...Object.values(ASSET_TYPE)),
        allowNull: false,
      },
      uploaded_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task_assets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_task_assets_file_type";');
  }
};