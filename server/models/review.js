'use strict';
const { Model } = require('sequelize');
const { REVIEW_VERDICT } = require('../constants/reviewConstants');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Submission, { foreignKey: 'submission_id' });
      Review.belongsTo(models.Company, { foreignKey: 'company_id' });
    }
  }
  Review.init({
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(REVIEW_VERDICT)),
      allowNull: true,
    },
    functionality: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    quality: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    documentation: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    communication: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    createdAt: 'reviewed_at',
    updatedAt: false,
  });
  return Review;
};
