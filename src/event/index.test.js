/* global before, after, beforeEach, afterEach */

'use strict';

import AWS from 'aws-sdk';
import sinon from 'sinon';
import manofletters from 'gfg-nodejs-libary-manofletters';
import { putKinesisRecord, getKinesisEventDatas, hasBodyParams } from './index';
import { ErrorMissingParameter } from '../error';

const expect = require('chai').expect;


describe('eventUtil', () => {
  const user = 'env-user-name';
  const region = 'env-region-name';
  const stream = 'stream-name';
  let currentUserBackup;
  let currentRegionBackup;
  let sandbox;

  before(() => {
    currentUserBackup = process.env.SERVICE_USER;
    currentRegionBackup = process.env.region;

    sinon.stub(manofletters, 'log').callsFake(() => {});
  });
  after(() => {
    process.env.SERVICE_USER = currentUserBackup;
    process.env.region = currentRegionBackup;
    manofletters.log.restore();
  });

  beforeEach(() => {
    process.env.SERVICE_USER = user;
    process.env.region = region;
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });


  describe('putKinesisRecord', () => {
    it('should successfully sent a kinesis event', (done) => {
      // const data = Object.assign({}, { event: eventType, user: process.env.SERVICE_USER }, {});
      const eventType = 'test-event-type';
      const payload = { payloadData: 'test-data' };
      const regionParam = 'region-param';
      const userParam = 'user-param';
      const expectedParams = {
        Data: JSON.stringify({ event: eventType, user: userParam, payloadData: 'test-data' }), /* required */
        PartitionKey: eventType, /* required */
        StreamName: stream /* required */
      };

      sandbox.stub(AWS, 'Kinesis').callsFake((callsParam) => {
        expect(callsParam).to.deep.equal({ region: regionParam });
        return {
          putRecord: (params, cb) => {
            expect(params).to.deep.equal(expectedParams);
            cb(null, {});
          }
        };
      });

      putKinesisRecord(eventType, payload, stream, userParam, regionParam)
        .then(() => {
          done();
        }).catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });

    it('should successfully sent a kinesis event using process.env.region and process.env.SERVICE_USER', (done) => {
      // const data = Object.assign({}, { event: eventType, user: process.env.SERVICE_USER }, {});
      const eventType = 'test-event-type';
      const payload = { payloadData: 'test-data' };
      const expectedParams = {
        Data: JSON.stringify({ event: eventType, user, payloadData: 'test-data' }), /* required */
        PartitionKey: eventType, /* required */
        StreamName: stream /* required */
      };

      sandbox.stub(AWS, 'Kinesis').callsFake((callsParam) => {
        expect(callsParam).to.deep.equal({ region });
        return {
          putRecord: (params, cb) => {
            expect(params).to.deep.equal(expectedParams);
            cb(null, {});
          }
        };
      });

      putKinesisRecord(eventType, payload, stream)
        .then(() => {
          done();
        }).catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });
  });

  describe('getKinesisEventDatas', () => {
    it('should successfully get one data from event', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }]
      };
      const expectedData = {
        event: 'eventTypeTest',
        user
      };

      const datas = getKinesisEventDatas(event, eventType);
      expect(datas.length).to.equal(1);
      expect(datas[0]).to.deep.equal(expectedData);

      done();
    });

    it('should successfully get all data from event', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }, {
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }]
      };
      const expectedData = {
        event: 'eventTypeTest',
        user
      };

      const datas = getKinesisEventDatas(event, eventType);
      expect(datas.length).to.equal(2);
      expect(datas[0]).to.deep.equal(expectedData);
      expect(datas[1]).to.deep.equal(expectedData);

      done();
    });

    it('should successfully only data from event of eventType eventTypeTest', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }, {
          kinesis: {
            partitionKey: 'ANOTHER_EVENT_TYPE',
            data: new Buffer(JSON.stringify({ event: 'ANOTHER_EVENT_TYPE', user })).toString('base64')
          }
        }, {
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }]
      };
      const expectedData = {
        event: 'eventTypeTest',
        user
      };

      const datas = getKinesisEventDatas(event, eventType);
      console.log('datas', datas);
      expect(datas.length).to.equal(2);
      expect(datas[0]).to.deep.equal(expectedData);
      expect(datas[1]).to.deep.equal(expectedData);

      done();
    });

    it('should successfully get data from event if process.env.SERVICE_USER is an empty string', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }]
      };
      const expectedData = {
        event: 'eventTypeTest',
        user
      };

      process.env.SERVICE_USER = '';
      const datas = getKinesisEventDatas(event, eventType);
      expect(datas[0]).to.deep.equal(expectedData);

      done();
    });

    it('should return null data for event user different from process.env.SERVICE_USER', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user: 'different-user' })).toString('base64')
          }
        }]
      };

      const datas = getKinesisEventDatas(event, eventType);
      expect(datas.length).to.equal(0);

      done();
    });

    it('should return null data for event eventType different from argument eventType', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer(JSON.stringify({ event: eventType, user })).toString('base64')
          }
        }]
      };

      const datas = getKinesisEventDatas(event, 'different event');
      expect(datas.length).to.equal(0);

      done();
    });


    it('should return null data for event is null', (done) => {
      const eventType = 'eventTypeTest';

      const datas = getKinesisEventDatas(null, eventType);
      expect(datas.length).to.equal(0);

      done();
    });


    it('should return null data for event with no Record list', (done) => {
      const eventType = 'eventTypeTest';
      const event = {};

      const datas = getKinesisEventDatas(event, eventType);
      expect(datas.length).to.equal(0);
      done();
    });

    it('should return null data for event that have data payload not a JSON string', (done) => {
      const eventType = 'eventTypeTest';
      const event = {
        Records: [{
          kinesis: {
            partitionKey: eventType,
            data: new Buffer('Not a JSON string').toString('base64')
          }
        }]
      };

      const datas = getKinesisEventDatas(event, eventType);
      expect(datas.length).to.equal(0);

      done();
    });
  });


  describe('hasBodyParams', () => {
    it('should successfully validate mandatory body params', (done) => {
      const event = {
        body: JSON.stringify({
          param1: 'test',
          param2: 'test'
        })
      };
      const mandatoryParams = ['param1', 'param2'];

      hasBodyParams(event, mandatoryParams)
        .then(() => {
          // It should succeed with no error
          done();
        }, (error) => {
          throw new Error('It should not have failed');
        })
        .catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });


    it('should return an ErrorMissingParameter for one missing parameter', (done) => {
      const event = {
        body: JSON.stringify({
          param1: 'test',
          param2: 'test'
        })
      };
      const mandatoryParams = ['param1', 'param2', 'param3'];

      hasBodyParams(event, mandatoryParams)
        .then(() => {
          throw new Error('It should not have succeeded');
        }, (error) => {
          expect(error.name).to.equal(new ErrorMissingParameter().name);
          expect(error.message).to.contain('param3');
          done();
        })
        .catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });


    it('should return an ErrorMissingParameter for null body attribute', (done) => {
      const event = {
        body: null
      };
      const mandatoryParams = ['param1', 'param2', 'param3'];

      hasBodyParams(event, mandatoryParams)
        .then(() => {
          throw new Error('It should not have succeeded');
        }, (error) => {
          expect(error.name).to.equal(new ErrorMissingParameter().name);
          expect(error.message).to.contain('No body found');
          done();
        })
        .catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });


    it('should return an ErrorMissingParameter for missing body attribute', (done) => {
      const event = {};
      const mandatoryParams = ['param1', 'param2', 'param3'];

      hasBodyParams(event, mandatoryParams)
        .then(() => {
          throw new Error('It should not have succeeded');
        }, (error) => {
          expect(error.name).to.equal(new ErrorMissingParameter().name);
          expect(error.message).to.contain('No body found');
          done();
        })
        .catch((error) => {
          // indicate that test fail and send error
          done(error);
        });
    });
  });
});
