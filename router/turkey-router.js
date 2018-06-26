'use strict';
/*
This is the same as this:
const express = require('express);
const Router = express.Router;
 */
import { Router } from 'express';
import bodyParser from 'body-parser';
import Turkey from '../model/turkey';
import logger from '../lib/logger';


// this is a third party module we are using to tit replace 
// the body-parser we wrote from scratch in labs 8-9
// only pass this is as middleware to POST and PUT requests
const jsonParser = bodyParser.json();
const turkeyRouter = new Router();

turkeyRouter.post('/api/turkey', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'TURKEY-ROUTER POST to /api/turkey - processing a request');
  if (!request.body.title) {
    logger.log(logger.INFO, 'TURKEY-ROUTER POST /api/turkey: Responding with 400 error for no title');
    return response.sendStatus(400);
  }

  // I need run the init() method (which returns a promise) on POST and PUT requests because Mongoose is still in the process of indexing fields that I flagged as "unique". If I don't run init() first, I get false positive tests that don't properly catch for 409 conflit errors when duplicate values are posted to the db. 
  Turkey.init()
    .then(() => {
      return new Turkey(request.body).save();
    })
    .then((newTurkey) => {
      logger.log(logger.INFO, `TURKEY-ROUTER POST:  a new turkey was saved: ${JSON.stringify(newTurkey)}`);
      return response.json(newTurkey);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      // a required property was not included, i.e. in this case, "title"
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      // we passed in a title that already exists on a resource in the db because in our Turkey model, we set title to be "unique"
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500); // Internal Server Error
    });
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
turkeyRouter.get('/api/turkey/:id?', (request, response) => {
  logger.log(logger.INFO, 'TURKEY-ROUTER GET /api/turkey/:id = processing a request');

  // TODO:
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below

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
      // we will hit here if we have a mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

turkeyRouter.put('/api/turkey/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'TURKEY-ROUTER PUT /api/turkey: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  // we need to pass these options into "findByIdAndUpdate" so we can actually return the newly modified document in the promise per "new", and "runValidators" ensures that the original validators we set on the model
  const options = {
    new: true,
    runValidators: true,
  };

  Turkey.init()
    .then(() => {
      return Turkey.findByIdAndUpdate(request.params.id, request.body, options)
    })
    .then((updatedTurkey) => {
      logger.log(logger.INFO, `TURKEY-ROUTER PUT - responding with a 200 status code for successful updated turkey: ${JSON.stringify(updatedTurkey)}`);
      return response.json(updatedTurkey);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      // a required property was not included, i.e. in this case, "title"
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      // we passed in a title that already exists on a resource in the db because in our Turkey model, we set title to be "unique"
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `TURKEY-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `TURKEY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

export default turkeyRouter;