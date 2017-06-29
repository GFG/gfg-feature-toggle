'use strict';


class ExtendableError extends Error {
  constructor(name = 'ErrorUnknown', message = null, status = 500) {
    super();
    this.message = message;
    this.status = status;
    this.stack = (new Error()).stack;
    this.name = name;
  }
}

class ErrorServer extends ExtendableError {
  constructor(m) {
    const message = m || 'An internal server error occurred.';
    super('SERVER_ERROR', message);
  }
}

class ErrorDB extends ExtendableError {
  constructor(m) {
    const message = m || 'An error occurred while trying to call the DB.';
    super('DB_ERROR', message);
  }
}

class ErrorNotFound extends ExtendableError {
  constructor(m) {
    const message = m || 'Request item was not Found.';
    super('NOT_FOUND', message, 404);
  }
}

class ErrorMissingParameter extends ExtendableError {
  constructor(m) {
    const message = m || 'Mandatory parameter is missing';
    super('MISSING_PARAMETER', message, 422);
  }
}


class ErrorKinesisPutRecord extends ExtendableError {
  constructor(m) {
    const message = m || 'Failed to put record in kinesis stream';
    super('KINESIS_PUT_RECORD_ERROR', message, 500);
  }
}

module.exports = {
  ExtendableError,
  ErrorServer,
  ErrorDB,
  ErrorNotFound,
  ErrorMissingParameter,
  ErrorKinesisPutRecord
};
