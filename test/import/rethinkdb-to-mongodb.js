var should = require('should');
var r = require('rethinkdb');
var Promise = require('bluebird');
var _ = require('lodash');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

var testData = require('../data.json');
var utils = require('../utils');
var mtrImport = require('../../lib/mtr');

describe('RethinkDBToMongoDB', function () {

  beforeEach(function (done) {
    return utils.insertRethinkDBTestData(utils.rethinkDBConnectionOpts, testData)(function () { })
      .then(function () {
        return utils.dropMongoDBTestDatabase(utils.testDBName)(function () { });
      })
      .nodeify(done);
  });

  it('should insert the test data and return a log object', function (done) {
    this.timeout(15000);
    mtrImport({
      source: 'rethinkdb',
      target: 'mongodb',
      db: utils.testDBName,
      rethinkdb: utils.rethinkDBConnectionOpts,
      mongodb: utils.mongoDBConnectionOpts
    })
    .then(function (importLog) {
      // Check that RethinkDB has all the right data
      importLog.should.be.an.Object;
      importLog.should.have.property('logs');
      importLog.should.have.property('tables');
      done();
    })
    .catch(done);
  });

  it('should throw an error if the database already exists', function (done) {
    this.timeout(15000);
    return utils.insertMongoDBTestData(utils.testDBName, testData)(function () { })
      .then(function () {
        return mtrImport({
          source: 'rethinkdb',
          target: 'mongodb',
          db: utils.testDBName,
          rethinkdb: utils.rethinkDBConnectionOpts,
          mongodb: utils.mongoDBConnectionOpts
        })
        .then(function () {
          done(new Error('Should have thrown error'), null);
        })
        .catch(function (err) {
          err.message.match(/database/);
          err.message.match(/exist/);
          done();
        });
      });
  });

  it('should map the `id` property to `_id`', function (done) {
    this.timeout(15000);
    return mtrImport({
      source: 'rethinkdb',
      target: 'mongodb',
      db: utils.testDBName,
      rethinkdb: utils.rethinkDBConnectionOpts,
      mongodb: utils.mongoDBConnectionOpts
    })
    .then(function () {
      return r.connect(utils.rethinkDBConnectionOpts)
        .then(function (conn) {
          return r.db(utils.rethinkDBConnectionOpts.db)
            .table('table1')('id')
            .coerceTo('array')
            .run(conn)
            .then(function (ids) {
              return mongoClient.connectAsync('mongodb://localhost:27017/' + utils.testDBName)
                .then(function (db) {
                  db = Promise.promisifyAll(db);
                  return db.collectionAsync('table1');
                })
                .then(function (collection) {
                  collection = Promise.promisifyAll(collection);
                  return collection.findAsync({});
                })
                .then(function (cursor) {
                  cursor = Promise.promisifyAll(cursor);
                  return cursor.toArrayAsync();
                })
                .then(function (docs) {
                  var _ids = docs.map(function (doc) {
                    return doc._id.toString();
                  });
                  ids.length.should.equal(testData.length);
                  ids.length.should.equal(_ids.length);
                  ids.sort().should.eql(_ids.sort());
                });
            });
        });
    })
    .nodeify(done);
  });

  after(function (done) {
    return utils.dropRethinkDBTestDatabase(utils.rethinkDBConnectionOpts)(function () { })
      .then(function () {
        // Don't drop it for now
        return utils.dropMongoDBTestDatabase(utils.testDBName)(function () { });
        //return true;
      })
      .nodeify(done);
  });
});
