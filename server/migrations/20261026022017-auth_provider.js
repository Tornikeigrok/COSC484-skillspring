'use strict';

const { AUTH_PROVIDERS } = require('../constants/authConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'auth_provider', {
      type: Sequelize.ENUM(...Object.values(AUTH_PROVIDERS)),
      allowNull: false,
      defaultValue: AUTH_PROVIDERS.LOCAL,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'auth_provider', {
      type: Object.values(AUTH_PROVIDERS),
      allowNull: false,
      defaultValue: AUTH_PROVIDERS.LOCAL,
    });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_auth_provider";');
  }
};
