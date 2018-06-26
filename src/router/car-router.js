'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Car from '../model/car';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const carRouter = new Router(); 

carRouter.post('/api/cars/', jsonParser, (req, res, next) => {
  logger.log(logger.INFO, 'Car Router POST to api/cars is processing req');
  if (!req.body.make) {
    logger.log(logger.INFO, 'Car Router POST api/cars: responding with 400 err for no make');
    return res.sendStatus(400);
  }

  Car.init()
    .then(() => {
      return new Car(req.body).save();
    })
    .then((newCar) => {
      logger.log(logger.INFO, `Car Router Post: a new car was saved: ${JSON.stringify(newCar)}`);
      return res.json(newCar);
    })
    .catch(next);
  return undefined;
});

carRouter.get('/api/cars/:id?', (req, res, next) => {
  logger.log(logger.INFO, 'Car Router GET api/cars/:id = processing req');
  return Car.findOne({ _id: req.params.id })
    .then((car) => {
      if (!car) {
        logger.log(logger.INFO, 'Car Router GER api/cars/:id responding with 404 status code for no car');
        return res.sendStatus(404);
      }
      logger.log(logger.INFO, 'Car Router GET api/cars/:id responding with 200 status code for successful GET');
      return res.json(car);
    })
    .catch(next);
});

carRouter.put('/api/cars/:id?', jsonParser, (req, res, next) => {
  if (!req.params.id) {
    logger.log(logger.INFO, 'Car Router PUT api/cars: Responding with 400 code for no id passed in');
    return res.sendStatus(400);
  }

  const options = {
    new: true,
    runValidators: true,
  };

  Car.init()
    .then(() => {
      return Car.findByIdAndUpdate(req.params.id, req.body, options);
    })
    .then((updatedCar) => {
      logger.log(logger.INFO, `Car Router PUT responding with a 200 status code for successful update to car: ${updatedCar}`);
      return res.json(updatedCar);
    })
    .catch(next);
  return undefined;
});

carRouter.delete('/api/cars/:id?', (req, res, next) => {
  if (!req.params.id) {
    logger.log(logger.INFO, 'Car DELETE /api/cars: DELETE req missing car id.');
    return res.sendStatus(400);
  }

  Car.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.sendStatus((result ? 204 : 404));
    })
    .catch(next);

  return undefined;
});

export default carRouter;
