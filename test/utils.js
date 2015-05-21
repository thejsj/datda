var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
var r = require('rethinkdb');

// Connection Variables
var testDBName = 'mongoDBToRethinkDB';
var rethinkDBConnectionOpts = {
  host: 'localhost',
  port: 28015,
  db: testDBName
};
var mongoDBConnectionOpts = {
  host: 'localhost',
  port: 27017,
  db: testDBName
};
exports.testDBName = testDBName;
exports.rethinkDBConnectionOpts = rethinkDBConnectionOpts;
exports.mongoDBConnectionOpts = mongoDBConnectionOpts;

exports.dropMongoDBTestDatabase = function (dbName) {
  return function (done) {
    return mongoClient.connectAsync('mongodb://localhost:27017/' + testDBName)
      .then(function (db) {
        db = Promise.promisifyAll(db);
        return db.dropDatabaseAsync();
      })
      .catch(function (err) { console.log(err); })
      .then(mongoClient.closeAsync)
      .then(done.bind(null, null));
  };
};

exports.dropRethinkDBTestDatabase = function (connectionOpts) {
   return function (done) {
    return r.connect(connectionOpts)
      .then(function (conn) {
        r.dbDrop(connectionOpts.db).run(conn)
          .catch(function () { })
          .then(function () {
            return conn.close();
          })
          .then(done.bind(null, null));
      });
  };
};

exports.insertMongoDBTestData = function (testDBName, testData) {
  return function (done) {
    return mongoClient.connectAsync('mongodb://localhost:27017/' + testDBName)
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
  };
};

exports.insertRethinkDBTestData = function (connectionOpts, data, primaryKey) {
  return function (done) {
    return r.connect(connectionOpts)
      .then(function (conn) {
        return r.dbDrop(connectionOpts.db).run(conn)
          .catch(function () { })
          .then(function () {
            return r.dbCreate(connectionOpts.db).run(conn);
          })
          .then(function () {
            conn.use(connectionOpts.db);
            return r.tableCreate('table1', { 'primaryKey': (primaryKey || 'id' )}).run(conn)
              .catch(function () { });
          })
          .then(function () {
            return r.table('table1')
              .insert(data)
              .run(conn);
          })
          .then(function () {
            return conn.close();
          })
          .nodeify(done);
      });
  };
};
