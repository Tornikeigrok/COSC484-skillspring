'use strict';
const {
  Model
} = require('sequelize');
const { ROLE } = require('../constants/role');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
  }
  User.init({
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    role: {
      type: DataTypes.ENUM(...Object.values(ROLE)),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: false,
  });
  return User;
};
