'use strict';
const {
  Model
} = require('sequelize');
const { ROLE } = require('../constants/authConstants');
const { AUTH_PROVIDERS } = require('../constants/authConstants');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Student, { foreignKey: 'user_id' });
      User.hasOne(models.Company, { foreignKey: 'user_id' });
    }
  }
  User.init({
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    auth_provider: {
      type: DataTypes.ENUM(...Object.values(AUTH_PROVIDERS)),
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLE)),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return User;
};
