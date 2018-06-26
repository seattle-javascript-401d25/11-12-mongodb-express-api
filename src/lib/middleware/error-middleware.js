'use strict';

import logger from '../logger';

export default (error, req, res, next) => {
  logger.log(logger.ERROR, `ERROR middleware: ${JSON.stringify(error)}`);
  if (error.status) {
    logger.log(logger.ERROR, `Responding with a ${error.status} error code and message ${error.message}`);
    return res.sendStatus(error.status);
  }
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('validation failed')) {
    logger.log(logger.ERROR, `Responding with a 400 error code and message ${error.message}`);
    return res.sendStatus(400);
  }
    
  if (errorMessage.includes('unauthorized')) {
    logger.log(logger.ERROR, `Responding with a 401 error code and message ${error.message}`);
    return res.sendStatus(401);
  }
    
  if (errorMessage.includes('objectid failed')) {
    logger.log(logger.ERROR, `Responding with a 404 error code and message ${error.message}`);
    return res.sendStatus(404);
  }
    
  if (errorMessage.includes('duplicate key')) {
    logger.log(logger.ERROR, '');
    return res.sendStatus(409);
  }
  logger.log(logger.ERROR, `Responding with a 500 code ${JSON.stringify(error)}`);
  next();
  return res.sendStatus(500);
};
