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
            return {
              name: coll.s.name,
              indexes: indexes
            }
          })
      }.bind(this)));
    }.bind(this))
};

MongoDriver.prototype.createTables = function (tables) {
  return q()
    .then(function () {
      if (!Array.isArray(tables)) throw new TypeError('`tables` object must be an array');
      tables.forEach(function (table) {
        if (typeof table.name !== 'string') throw new TypeError('`name` property in table must be a string');
      });
      return q.all(tables.map(function (table) {
        return this.db.createCollectionAsync(table.name);
      }.bind(this)));
    }.bind(this));
};

MongoDriver.prototype.getIndexes = function () {

};

MongoDriver.prototype.createIndexes = function (indexes) {

};

MongoDriver.prototype.getRows = function () {

};

MongoDriver.prototype.insertRows = function (rows) {

};

module.exports = MongoDriver;