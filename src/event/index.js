'use strict';

import AWS from 'aws-sdk';
import manofletters from 'gfg-nodejs-libary-manofletters';
import { ErrorMissingParameter, ErrorKinesisPutRecord } from '../error';

/**
 * @param eventType     event partition Key, will also be sent in the payload
 * @param payload       payload data to send to the event.
 * @param streamParam   AWS stream name to publish the event.
 * @param userName      username set inside the payload.
 * @returns {Object}
 */

export const generatePayload = (eventType, payload, streamParam, userName) => {
  const data = Object.assign({}, { event: eventType, user: userName }, payload);
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
export const putKinesisRecord = (eventType, payload, streamParam, userParam = null, regionParam = null) => new Promise((resolve, reject) => {
/* eslint-enable max-len */
  const regionName = regionParam || process.env.region;
  const userName = userParam || process.env.SERVICE_USER;

  const kinesis = new AWS.Kinesis({ region: regionName });
  const params = generatePayload(eventType, payload, streamParam, userName);
  manofletters.log('info', `adding event to Kinesis ${JSON.stringify(params)}`);
  kinesis.putRecord(params, (err, data) => {
    if (err) {
      manofletters.log('error', err);
      reject(new ErrorKinesisPutRecord());  // error, rejected
    } else {
      resolve(data);
    }
  });
});

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
export const getKinesisEventDatas = (event, eventType) => {
  const result = [];

  if (event && event.Records) {
    event.Records.forEach((record) => {
      try {
        const kinesis = record.kinesis;
        const data = JSON.parse(new Buffer(kinesis.data, 'base64').toString());
        const partitionKey = kinesis.partitionKey;
        const user = process.env.SERVICE_USER;

        manofletters.log('info', `getKinesisEventPayloads data ${JSON.stringify(data)}`);

        // Accept only event for input eventType
        // and If current service User is defined, accept only event from this user
        if (partitionKey === eventType && (user === '' || user === data.user)) {
          result.push(data);
        }
      } catch (error) {
        manofletters.log('error', `Failed to read ${record}. Event has been ignored.`);
        manofletters.log('error', error);
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
export const hasBodyParams = (event, mandatoryParams) => new Promise((resolve, reject) => {
  if (!Object.prototype.hasOwnProperty.call(event, 'body') || event.body === null) {
    return reject(new ErrorMissingParameter(`No body found. Request parameter(s) are missing: ${mandatoryParams.join()}`));
  }

  const params = JSON.parse(event.body);
  const missingParams = [];

  mandatoryParams.forEach((paramName) => {
    if (params[paramName] === null || params[paramName] === undefined) {
      missingParams.push(paramName);
    }
  });

  if (missingParams.length > 0) {
    reject(new ErrorMissingParameter(`Request parameter(s) are missing in the body: ${missingParams.join()}`));
  } else {
    resolve();
  }
});

