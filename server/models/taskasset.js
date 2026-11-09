'use strict';
const { Model } = require('sequelize');
const { ASSET_TYPE } = require('../constants/taskConstants');

module.exports = (sequelize, DataTypes) => {
  class TaskAsset extends Model {
    static associate(models) {
      TaskAsset.belongsTo(models.Task, { foreignKey: 'task_id' });
    }
  }
  TaskAsset.init({
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    original_filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stored_filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_type: {
      type: DataTypes.ENUM(...Object.values(ASSET_TYPE)),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'TaskAsset',
    tableName: 'task_assets',
    createdAt: 'uploaded_at',
    updatedAt: false,
  });
  return TaskAsset;
};
