'use strict';

import mongoose from 'mongoose';

const carSchema = mongoose.Schema({
  make: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    unique: true,
  },
  trim: {
    type: String,
  },
  addOns: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('cars', carSchema, 'cars', skipInit);
