var Promise = require('bluebird');
var mongo = Promise.promisifyAll(require('mongodb').MongoClient);
var q = require('q');

var MongoDriver = function (connectionOpts) {
  this.connectionOpts = connectionOpts;
  var c = connectionOpts;
  this.connectionURL = 'mongodb://' + c.host + ':' + c.port + '/' + c.db;
};

/*!
 * Connect to the Mongo Database
 * @return <Promise>
 */
MongoDriver.prototype.connect = function () {
 return mongo.connectAsync(this.connectionURL)
    .then(function (db) {
      this.db = Promise.promisifyAll(db);
      this.conn = this.db;
      return this.db.statsAsync();
    }.bind(this));
};

/*!
 * Close the connection to the Mongo Database
 * @return <Promise>
 */
MongoDriver.prototype.closeConnection = function () {
  return q()
    .then(function () {
      this.db.close();
    });
};

/*!
 * Get all collections/tables in a database
 * @return <Promise>
 */
MongoDriver.prototype.getTables = function () {
  return this.db.collectionsAsync()
    .then(function (collections){
      var colls = collections
        .filter(function (coll) {
          return coll.s.name !== 'system.indexes';
        });
      return q.all(colls.map(function (coll) {
        coll = Promise.promisifyAll(coll);
        return coll.indexesAsync()
          .then(function (indexes) {
            // TODO: Parse indexes
            console.log(indexes);
            return {
              name: coll.s.name,
              indexes: indexes // Have to look into this more
            };
          });
      }.bind(this)));
    }.bind(this));
};

/*!
 * Create all tables through an object with a `name` property and a `indexes` property
 * @param <Array>
 * @return <Promise>
 */
MongoDriver.prototype.createTables = function (tables) {
  return q()
    .then(function () {
      if (!Array.isArray(tables)) throw new TypeError('`tables` object must be an array');
      tables.forEach(function (table) {
        if (typeof table.name !== 'string') throw new TypeError('`name` property in table must be a string');
      });
      return q.all(tables.map(function (table) {
        // TODO: Add indexes
        return this.db.createCollectionAsync(table.name);
      }.bind(this)));
    }.bind(this));
};

/*!
 * Get number of rows in a table
 * @param <String>
 * @return <Number>
 */
MongoDriver.prototype.getNumberOfRows = function (collectionName) {
  return this.db.collectionAsync(collectionName)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.countAsync();
    });
};

/*!
 * Get rows from a collection
 * @param <String>
 * @param <Number>
 * @param <Number>
 * @return <Promise> --> <Array>
 */
MongoDriver.prototype.getRows = function (collectionName, numberOfRows, offset) {
  return this.db.collectionAsync(collectionName)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.find()
        .limit(numberOfRows)
        .skip(offset);
    })
    .then(function (cursor) {
      cursor = Promise.promisifyAll(cursor);
      return cursor.toArrayAsync();
    })
};

/*!
 * Insert rows into a collection
 * @param <String>
 * @param <Array>
 * @return <Promise>
 */
MongoDriver.prototype.insertRows = function (collectionName, rows) {
  return this.db.collectionAsync(collectionName)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.insert(rows);
    });
};

module.exports = MongoDriver;
