'use strict';
const { Model } = require('sequelize');
const { TASK_DIFFICULTY, TASK_STATUS, TASK_TYPE } = require('../constants/taskConstants');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
        Task.belongsTo(models.Company, { foreignKey: 'company_id' });
    }
  }
  Task.init({
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM(...Object.values(TASK_DIFFICULTY)),
      allowNull: false,
    },
    estimated_hours: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TASK_STATUS)),
      allowNull: false,
      defaultValue: TASK_STATUS.OPEN,
    },
    task_type: {
      type: DataTypes.ENUM(...Object.values(TASK_TYPE)),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return Task;
};
