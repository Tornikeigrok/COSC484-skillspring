'use strict';
const { Model } = require('sequelize');
const { VERIFICATION_STATUS } = require('../constants/authConstants');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
        Company.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Company.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    website: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    verification_status: {
      type: DataTypes.ENUM(...Object.values(VERIFICATION_STATUS)),
      allowNull: false,
      defaultValue: VERIFICATION_STATUS.UNVERIFIED,
    },
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return Company;
};
