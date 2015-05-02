require('should');
var _ = require('lodash');
var q = require('q');
var Promise = require('bluebird');
var MongoDriver = require('../../lib/drivers/mongodb');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

describe('MongoDB', function () {

  var mongo;

  // Connect to Mongo
  before(function (done) {
    mongo = new MongoDriver({
      host: 'localhost',
      port: 27017,
      db: 'motoreTest'
    });
    mongo.connect()
     .then(done.bind(null, null));
  });

  describe('connecting', function () {

    it('should have connected propertly', function () {
      mongo.conn.should.be.a.Object;
    });

    // Doesn't work
    xit('should throw an error if the database doesn\'t exists', function (done) {
      var conn = new MongoDriver({
          host: 'localhost',
          port: 27017,
          db: 'databaseThatDoesntExist'
        });
        conn.connect()
         .catch(function (err) {
           done();
         });
    });

    it('should throw an error if it can\'t connect to the host', function (done) {
        var conn = new MongoDriver({
          host: 'localhost',
          port: 9999,
          db: 'databaseThatDoesntExist'
        });
        conn.connect()
         .catch(function (err) {
           err.name.should.equal('MongoError');
           err.message.indexOf('ECONNREFUSED').should.not.equal(-1);
           done();
         });
    });

  });

  describe('getTables', function () {

    var tables = ['table1', 'helloWorld' + Math.random(), 'anotherTable' + Math.random()];
    before(function (done) {
      mongoClient.connectAsync('mongodb://localhost:27017/motoreTest')
        .then(function (db) {
          db = Promise.promisifyAll(db);
          return db.dropDatabaseAsync()
            .then(function () {
              return q.all(tables.map(function (table) {
                return db.createCollectionAsync(table);
              }));
            });
        })
        .then(mongoClient.closeAsync)
        .then(done.bind(null, null));
    });

    it('should get all the tables in the database as an object with a name property', function (done) {
      mongo.getTables()
        .then(function (collections) {
          _.pluck(collections, 'name').sort().should.eql(tables.sort());
          done();
        });
    });

    // After
    after(function (done) {
      mongoClient.connectAsync('mongodb://localhost:27017/motoreTest')
        .then(function (db) {
          db = Promise.promisifyAll(db);
          return db.dropDatabaseAsync();
        })
        .then(mongoClient.closeAsync)
        .then(done.bind(null, null));
    });
  });

  describe('createTables', function () {

    it('should create tables passed to it as an object', function (done) {
      var tables = [
        { name: 'hello' },
        { name: 'hello' + Math.random() },
        { name: 'hello2' },
      ];
      mongo.createTables(tables)
        .then(function () {
          return mongo.getTables();
        })
        .then(function (_tables) {
          _.pluck(tables, 'name').sort().should.eql(_.pluck(tables, 'name').sort());
          done();
        })
        .catch(done);
    });
  });

});
