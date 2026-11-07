'use strict';
const { Model } = require('sequelize');
const { PROPOSAL_STATUS } = require('../constants/proposalConstants');

module.exports = (sequelize, DataTypes) => {
  class Proposal extends Model {
    static associate(models) {
      Proposal.belongsTo(models.Task, { foreignKey: 'task_id' });
      Proposal.belongsTo(models.Student, { foreignKey: 'student_id' });
    }
  }
  Proposal.init({
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approach: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    proposed_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PROPOSAL_STATUS)),
      allowNull: false,
      defaultValue: PROPOSAL_STATUS.PENDING,
    },
  }, {
    sequelize,
    modelName: 'Proposal',
    tableName: 'proposals',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return Proposal;
};
