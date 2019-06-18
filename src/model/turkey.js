'use strict';

import mongoose from 'mongoose';

const turkeySchema = mongoose.Schema({
  species: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    minlength: 5,
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('turkey', turkeySchema, 'turkey', skipInit);
