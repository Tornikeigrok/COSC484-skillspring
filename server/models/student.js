'use strict';
const { Model } = require('sequelize');
const { VERIFICATION_STATUS } = require('../constants/authConstants');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
  }
  Student.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    github_url: {
      type: DataTypes.TEXT,
    },
    university: {
      type: DataTypes.TEXT,
    },
    graduation_year: {
      type: DataTypes.INTEGER,
    },
    verification_status: {
      type: DataTypes.ENUM(...Object.values(VERIFICATION_STATUS)),
      allowNull: false,
      defaultValue: VERIFICATION_STATUS.UNVERIFIED,
    },
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return Student;
};
