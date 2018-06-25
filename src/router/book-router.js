'use strict';

/*
This is the same as this:
const express = require('express);
const Router = express.Router;
 */
import { Router } from 'express';
import bodyParser from 'body-parser';
import Book from '../model/book';
import logger from '../lib/logger';
import mongoDbErrResponse from '../lib/mongoDbErrResponse';
// import { mongo } from 'mongoose';

// this is a third party module we are using to tit replace 
// the body-parser we wrote from scratch in labs 8-9
// only pass this is as middleware to POST and PUT requests
const jsonParser = bodyParser.json();
const bookRouter = new Router();

bookRouter.post('/api/v1/books', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'BOOK-ROUTER POST to /api/v1/books - processing a request');
  if (!request.body.title) {
    logger.log(logger.INFO, 'BOOK-ROUTER POST /api/v1/books: Responding with 400 error for no title');
    return response.sendStatus(400);
  }

  // I need run the init() method (which returns a promise) on POST and PUT requests because Mongoose is still in the process of indexing fields that I flagged as "unique". If I don't run init() first, I get false positive tests that don't properly catch for 409 conflit errors when duplicate values are posted to the db. 
  Book.init()
    .then(() => {
      return new Book(request.body).save();
    })
    .then((newBook) => {
      logger.log(logger.INFO, `BOOK-ROUTER POST:  a new book was saved: ${JSON.stringify(newBook)}`);
      return response.json(newBook);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      return mongoDbErrResponse(err, request, response, 'BOOK-ROUTER');
    });
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
bookRouter.get('/api/v1/books/:id?', (request, response) => {
  logger.log(logger.INFO, 'BOOK-ROUTER GET /api/v1/books/:id = processing a request');

  // TODO:
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below

  return Book.findOne({ _id: request.params.id })
    .then((note) => {
      if (!note) {
        logger.log(logger.INFO, 'BOOK-ROUTER GET /api/v1/books/:id: responding with 404 status code for no note found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'BOOK-ROUTER GET /api/v1/books/:id: responding with 200 status code for successful get');
      return response.json(note);
    })
    .catch((err) => {
      // we will hit here if we have a mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `BOOK-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `BOOK-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

bookRouter.put('/api/v1/books/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'BOOK-ROUTER PUT /api/v1/books: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  // we need to pass these options into "findByIdAndUpdate" so we can actually return the newly modified document in the promise per "new", and "runValidators" ensures that the original validators we set on the model
  const options = {
    new: true,
    runValidators: true,
  };

  Book.init()
    .then(() => {
      return Book.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedBook) => {
      logger.log(logger.INFO, `BOOK-ROUTER PUT - responding with a 200 status code for successful updated book: ${JSON.stringify(updatedBook)}`);
      return response.json(updatedBook);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      return mongoDbErrResponse(err, request, response, 'BOOK-ROUTER');
    });
  return undefined;
});

export default bookRouter;
