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
      this.db = db;
      this.conn = this.db;
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

MongoDriver.prototype.getTables = function () {

};

MongoDriver.prototype.createTables = function (tables) {

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
