'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    static associate(models) {
      Submission.belongsTo(models.Proposal, { foreignKey: 'proposal_id' });
      Submission.belongsTo(models.Student, { foreignKey: 'student_id' });
    }
  }
  Submission.init({
    proposal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submission_zip_path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    github_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Submission',
    tableName: 'submissions',
    createdAt: 'submitted_at',
    updatedAt: false,
  });
  return Submission;
};
