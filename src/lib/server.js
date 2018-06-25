'use strict';

import express from 'express';
import mongoose, { mongo } from 'mongoose';
import logger from './logger';
import carRouter from '../router/car-router';

const app = express();
const PORT = process.env.PORT || 3000;
let server;

app.use(carRouter);

app.all('*', (req, res) => {
  logger.log(logger.INFO, ' SERVER: returning a 404 from the catch all route');
  return res.status(404).send('Route not registered');
});

const startServer = () => {
  return mongoose.connect(process.env.MONGOD_URI)
    .then(() => {
      server = app.listen(PORT, () => {
        logger.log(logger.INFO, `SERVER is listening on PORT ${PORT}`);
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'Server is off');
      });
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
