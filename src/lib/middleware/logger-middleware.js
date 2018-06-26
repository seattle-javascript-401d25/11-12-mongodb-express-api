'use strict';

import logger from '../logger';

export default (req, res, next) => {
  logger.log(logger.INFO, `Processing a ${req.method} on ${req.url} from logger middleware`);
  return next();
};
