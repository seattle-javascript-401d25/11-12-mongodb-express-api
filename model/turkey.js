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

// Ran into a bug coding this, followed instructions on this stackoverflow page:
// https://stackoverflow.com/questions/50687592/jest-and-mongoose-jest-has-detected-opened-handles
// the first arg of mongoose.model is the name of your collection
const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('turkey', turkeySchema, 'turkey', skipInit);
