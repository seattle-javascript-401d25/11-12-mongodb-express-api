'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Car from '../model/car';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const carRouter = new Router();

carRouter.post('/api/cars', jsonParser, (req, res) => {
  logger.log(logger.INFO, 'Car Router POST to api/cars is processing req');
  if (!req.body.title) {
    logger.log(logger.INFO, 'Car Router POST api/cars: responding with 400 err for no make');
    return res.sendStatus(404);
  }

  Car.init()
    .then(() => {
      return new Car(req.body).save();
    })
    .then((newCar) => {
      logger.log(logger.INFO, `Car Router Post: a new car was saved: ${JSON.stringify(newCar)}`);
      return res.json(newCar);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objected failed')) {
        logger.log(logger.ERROR, `Car Router PUT: responding with 404 status code to mongdb error, objectId ${req.params.id} failed, ${err.message}`);
        return res.sendStatus(404);  
      }
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `Car Router PUT: responding with 400 status code bad request  ${err.message}`);
        return res.sendStatus(400);  
      }
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `Car Router PUT: responding with 409 status code duplicate key  ${err.message}`);
        return res.sendStatus(409);  
      }
      logger.log(logger.ERROR, `Car Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
    });
  return undefined;
});
