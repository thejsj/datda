var r = require('rethinkdb');
require('rethinkdb-init')(r);

var RethinkDBClient  = function (connectionOpts) {
  this.connectionOpts = connectionOpts;
};

/*!
 * Connect to the database
 * @return <Promise>
 */
RethinkDBClient.prototype.connect = function () {
  return r.connect(this.connectionOpts)
    .then(function (conn) {
      this.conn = conn;
      this.conn.use(this.connectionOpts.db);
    }.bind(this));
};

/*!
 * Close the connection to the database
 * @return <Promise>
 */
RethinkDBClient.prototype.closeConnection = function () {
  return this.conn.close();
};

RethinkDBClient.prototype.getTables = function () {
  return this.db.collections()
    .then(function (collectionNames) {
      console.log('collectionNames', collectionNames);
      return collectionNames;
    }.bind(this));
};

RethinkDBClient.prototype.createTables = function (tables) {

};

RethinkDBClient.prototype.getIndexes = function () {

};

RethinkDBClient.prototype.createIndexes = function (indexes) {

};

RethinkDBClient.prototype.getRows = function () {

};

RethinkDBClient.prototype.insertRows = function (rows) {

};

module.exports = RethinkDBClient;
