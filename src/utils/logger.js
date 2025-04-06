const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File logging - errors
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'error.log'), 
      level: 'error' 
    }),
    // File logging - all logs
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'combined.log')
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'rejections.log')
    })
  ]
});

// Create a stream object for Morgan integration
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = {
  logger,
  stream
};