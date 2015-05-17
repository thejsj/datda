var testData = require('../data.json');
var r = require('rethinkdb');
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

var utils = require('../utils');
var mtrImport = require('../../lib/motore');

describe('MongoToRethinkDB', function () {

  before(function (done) {
    return utils.insertMongoDBTestData(utils.testDBName, testData)(function () { })
      .then(function () {
        return utils.dropRethinkDBTestDatabase(utils.rethinkDBConnectionOpts)(function () { });
      })
      .nodeify(done);
  });

  it('should insert the test data', function (done) {
    this.timeout(15000);
    mtrImport({
      source: 'mongodb',
      target: 'rethinkdb',
      db: utils.testDBName,
      rethinkdb: utils.rethinkDBConnectionOpts,
      mongodb: utils.mongoDBConnectionOpts
    })
    .then(function (importLog) {
      // Check that RethinkDB has all the right data
      done();
    })
    .catch(done);
  });

  after(function (done) {
    return utils.dropMongoDBTestDatabase(utils.testDBName)(function () { })
      .then(function () {
        // Don't drop it for now
     //   return utils.dropRethinkDBTestDatabase(utils.rethinkDBConnectionOpts)(function () { });
        return true;
      })
      .nodeify(done);
  });
});
