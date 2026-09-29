'use strict';

const mongoose = require('mongoose');
const { ROLE } = require('../constants/role');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true
  },
  password_updated_at: {
    type: Date,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLE),
    required: true,
  },
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: false 
  },
});

module.exports = mongoose.model('User', userSchema);
