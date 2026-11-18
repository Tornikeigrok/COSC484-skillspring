'use strict';

const { SUBMISSION_ZIP_STATUS } = require('../constants/submissionConstants');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('submissions', 'zip_status', {
      type: Sequelize.ENUM(...Object.values(SUBMISSION_ZIP_STATUS)),
      allowNull: false,
      defaultValue: SUBMISSION_ZIP_STATUS.PENDING,
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('submissions', 'zip_status')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_submissions_zip_status";')
  }
};
