'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExtendableError = function (_Error) {
  _inherits(ExtendableError, _Error);

  function ExtendableError() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ErrorUnknown';
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var status = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;

    _classCallCheck(this, ExtendableError);

    var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this));

    _this.message = message;
    _this.status = status;
    _this.stack = new Error().stack;
    _this.name = name;
    return _this;
  }

  return ExtendableError;
}(Error);

var ErrorServer = function (_ExtendableError) {
  _inherits(ErrorServer, _ExtendableError);

  function ErrorServer(m) {
    _classCallCheck(this, ErrorServer);

    var message = m || 'An internal server error occurred.';
    return _possibleConstructorReturn(this, (ErrorServer.__proto__ || Object.getPrototypeOf(ErrorServer)).call(this, 'SERVER_ERROR', message));
  }

  return ErrorServer;
}(ExtendableError);

var ErrorDB = function (_ExtendableError2) {
  _inherits(ErrorDB, _ExtendableError2);

  function ErrorDB(m) {
    _classCallCheck(this, ErrorDB);

    var message = m || 'An error occurred while trying to call the DB.';
    return _possibleConstructorReturn(this, (ErrorDB.__proto__ || Object.getPrototypeOf(ErrorDB)).call(this, 'DB_ERROR', message));
  }

  return ErrorDB;
}(ExtendableError);

var ErrorNotFound = function (_ExtendableError3) {
  _inherits(ErrorNotFound, _ExtendableError3);

  function ErrorNotFound(m) {
    _classCallCheck(this, ErrorNotFound);

    var message = m || 'Request item was not Found.';
    return _possibleConstructorReturn(this, (ErrorNotFound.__proto__ || Object.getPrototypeOf(ErrorNotFound)).call(this, 'NOT_FOUND', message, 404));
  }

  return ErrorNotFound;
}(ExtendableError);

var ErrorMissingParameter = function (_ExtendableError4) {
  _inherits(ErrorMissingParameter, _ExtendableError4);

  function ErrorMissingParameter(m) {
    _classCallCheck(this, ErrorMissingParameter);

    var message = m || 'Mandatory parameter is missing';
    return _possibleConstructorReturn(this, (ErrorMissingParameter.__proto__ || Object.getPrototypeOf(ErrorMissingParameter)).call(this, 'MISSING_PARAMETER', message, 422));
  }

  return ErrorMissingParameter;
}(ExtendableError);

var ErrorKinesisPutRecord = function (_ExtendableError5) {
  _inherits(ErrorKinesisPutRecord, _ExtendableError5);

  function ErrorKinesisPutRecord(m) {
    _classCallCheck(this, ErrorKinesisPutRecord);

    var message = m || 'Failed to put record in kinesis stream';
    return _possibleConstructorReturn(this, (ErrorKinesisPutRecord.__proto__ || Object.getPrototypeOf(ErrorKinesisPutRecord)).call(this, 'KINESIS_PUT_RECORD_ERROR', message, 500));
  }

  return ErrorKinesisPutRecord;
}(ExtendableError);

module.exports = {
  ExtendableError: ExtendableError,
  ErrorServer: ErrorServer,
  ErrorDB: ErrorDB,
  ErrorNotFound: ErrorNotFound,
  ErrorMissingParameter: ErrorMissingParameter,
  ErrorKinesisPutRecord: ErrorKinesisPutRecord
};