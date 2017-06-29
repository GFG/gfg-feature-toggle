'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasBodyParams = exports.getKinesisEventDatas = exports.putKinesisRecord = exports.generatePayload = undefined;

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _gfgNodejsLibaryManofletters = require('gfg-nodejs-libary-manofletters');

var _gfgNodejsLibaryManofletters2 = _interopRequireDefault(_gfgNodejsLibaryManofletters);

var _error = require('../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param eventType     event partition Key, will also be sent in the payload
 * @param payload       payload data to send to the event.
 * @param streamParam   AWS stream name to publish the event.
 * @param userName      username set inside the payload.
 * @returns {Object}
 */

var generatePayload = exports.generatePayload = function generatePayload(eventType, payload, streamParam, userName) {
  var data = Object.assign({}, { event: eventType, user: userName }, payload);
  return {
    Data: JSON.stringify(data), /* required */
    PartitionKey: eventType, /* required */
    StreamName: streamParam /* required */
  };
};

/**
 * @param eventType     event partition Key, will also be sent in the payload
 * @param payload       payload data to send to the event.
 * @param streamParam   AWS stream name to publish the event.
 * @param userParam     optional, will default to process.env.SERVICE_USER.
 *                      userParam will be added to event payload
 * @param regionParam   optional, will default to process.env.region value.
 *                      region of the AWS stream
 * @returns {Promise}
 */
/* eslint-disable max-len */
var putKinesisRecord = exports.putKinesisRecord = function putKinesisRecord(eventType, payload, streamParam) {
  var userParam = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var regionParam = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  return new Promise(function (resolve, reject) {
    /* eslint-enable max-len */
    var regionName = regionParam || process.env.region;
    var userName = userParam || process.env.SERVICE_USER;

    var kinesis = new _awsSdk2.default.Kinesis({ region: regionName });
    var params = generatePayload(eventType, payload, streamParam, userName);
    _gfgNodejsLibaryManofletters2.default.log('info', 'adding event to Kinesis ' + JSON.stringify(params));
    kinesis.putRecord(params, function (err, data) {
      if (err) {
        _gfgNodejsLibaryManofletters2.default.log('error', err);
        reject(new _error.ErrorKinesisPutRecord()); // error, rejected
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Return list of event data for all Kinesis event received filter by :
 *  - event partition key === input eventType
 *  - event payload user === current serverless user setting (process.env.SERVICE_USER)
 *    if no serverless user setting, will ignore this filtering rule
 *
 * Will return list of data payload for event of type 'eventType'
 *
 * @param event
 * @param eventType
 * @returns []
 */
var getKinesisEventDatas = exports.getKinesisEventDatas = function getKinesisEventDatas(event, eventType) {
  var result = [];

  if (event && event.Records) {
    event.Records.forEach(function (record) {
      try {
        var kinesis = record.kinesis;
        var data = JSON.parse(new Buffer(kinesis.data, 'base64').toString());
        var partitionKey = kinesis.partitionKey;
        var user = process.env.SERVICE_USER;

        _gfgNodejsLibaryManofletters2.default.log('info', 'getKinesisEventPayloads data ' + JSON.stringify(data));

        // Accept only event for input eventType
        // and If current service User is defined, accept only event from this user
        if (partitionKey === eventType && (user === '' || user === data.user)) {
          result.push(data);
        }
      } catch (error) {
        _gfgNodejsLibaryManofletters2.default.log('error', 'Failed to read ' + record + '. Event has been ignored.');
        _gfgNodejsLibaryManofletters2.default.log('error', error);
      }
    });
  }

  return result;
};

/**
 * Check if mandatoryParams list are all present in event body
 *
 * Return promise with reject(ErrorMissingParameter) if any missing params or body
 *
 * @param event           {} event from lambda containing params
 * @param mandatoryParams [] list of expected params inside the body attribute
 */
var hasBodyParams = exports.hasBodyParams = function hasBodyParams(event, mandatoryParams) {
  return new Promise(function (resolve, reject) {
    if (!Object.prototype.hasOwnProperty.call(event, 'body') || event.body === null) {
      return reject(new _error.ErrorMissingParameter('No body found. Request parameter(s) are missing: ' + mandatoryParams.join()));
    }

    var params = JSON.parse(event.body);
    var missingParams = [];

    mandatoryParams.forEach(function (paramName) {
      if (params[paramName] === null || params[paramName] === undefined) {
        missingParams.push(paramName);
      }
    });

    if (missingParams.length > 0) {
      reject(new _error.ErrorMissingParameter('Request parameter(s) are missing in the body: ' + missingParams.join()));
    } else {
      resolve();
    }
  });
};