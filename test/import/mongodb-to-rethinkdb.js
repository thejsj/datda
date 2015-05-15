var testData = require('../data.json');
var r = require('rethinkdb');
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

var mongoDriver = require('../../lib/drivers/mongodb');
var rethinkdbDriver = require('../../lib/drivers/rethinkdb');

var dbName = 'mongoDBToRethinkDB';

var dropMongoTestDatabase = function (done) {
  mongoClient.connectAsync('mongodb://localhost:27017/' + dbName)
    .then(function (db) {
      db = Promise.promisifyAll(db);
      return db.dropDatabaseAsync();
    })
    .then(mongoClient.closeAsync)
    .then(done.bind(null, null));
};


describe('MongoToRethinkDB', function () {

  before(function () {
    // Insert data into MongoDB
    mongoClient.connectAsync('mongodb://localhost:27017/motoreTest')
      .then(function (db) {
        db = Promise.promisifyAll(db);
        return db.dropDatabaseAsync()
          .then(function () {
            return db.createCollectionAsync('table1')
             .then(function () {
               return db.collectionAsync('table1');
             });
          })
          .then(function (collection) {
            collection = Promise.promisifyAll(collection);
            return collection.insertAsync(testData);
          });
      })
      .then(mongoClient.closeAsync)
      .then(done.bind(null, null));
  });


  after(dropDatabase);
});
