'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Turkey from '../model/turkey';
import logger from '../lib/logger';


const jsonParser = bodyParser.json();
const turkeyRouter = new Router();

turkeyRouter.post('/api/turkey/', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'TURKEY-ROUTER POST to /api/turkey - processing a request');
  if (!request.body.species) {
    logger.log(logger.INFO, 'TURKEY-ROUTER POST /api/turkey: Responding with 400 error for no species');
    return response.sendStatus(400);
  }


  Turkey.init()
    .then(() => {
      return new Turkey(request.body).save();
    })
    .then((newTurkey) => {
      logger.log(logger.INFO, `TURKEY-ROUTER POST:  a new turkey was saved: ${JSON.stringify(newTurkey)}`);
      return response.json(newTurkey);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }


      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
     
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});


turkeyRouter.get('/api/turkey/:id?', (request, response) => {
  logger.log(logger.INFO, 'TURKEY-ROUTER GET /api/turkey/:id = processing a request');
 

  return Turkey.findOne({ _id: request.params.id })
    .then((turkey) => {
      if (!turkey) {
        logger.log(logger.INFO, 'TURKEY-ROUTER GET /api/turkey/:id: responding with 404 status code for no turkey found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'TURKEY-ROUTER GET /api/turkey/:id: responding with 200 status code for successful get');
      return response.json(turkey);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

turkeyRouter.put('/api/turkey/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'TURKEY-ROUTER PUT /api/turkey: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }


  const options = {
    new: true,
    runValidators: true,
  };

  Turkey.init()
    .then(() => {
      return Turkey.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedTurkey) => {
      logger.log(logger.INFO, `TURKEY-ROUTER PUT - responding with a 200 status code for successful updated turkey: ${JSON.stringify(updatedTurkey)}`);
      return response.json(updatedTurkey);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      
      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

turkeyRouter.delete('/api/turkey/:id?', (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'Turkey DELETE /api/turkey: DELETE missing turkey id.');
    return response.sendStatus(400);
  }
  Turkey.findByIdAndRemove(request.params.id)
    .then(() => {
      response.sendStatus(204);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `Turkey Router DELETE: responding with 400 status code bad request ${err.message}`);
        return request.sendStatus(400);
      }
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `Turkey Router DELETE: responding with 409 status code duplicate key ${err.message}`);
        return response.sendStatus(409);
      }
      logger.log(logger.ERROR, `Turkey Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

export default turkeyRouter;

