var r = require('rethinkdb');
var q = require('q');
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

/*!
 * Get all collections/tables in a database
 * @return <Promise>
 */
RethinkDBClient.prototype.getTables = function () {
  return r.tableList().run(this.conn)
    .then(function (tableNames) {
      return q.all(tableNames.map(function (table) {
        // TODO: Get primary index
        return {
          name: table
        };
      }));
    }.bind(this));
};

/*!
 * Create all tables through an object with a `name` property and a `indexes` property
 * @param <Array>
 * @return <Promise>
 */
RethinkDBClient.prototype.createTables = function (tables) {
  return r.init(this.connectionOpts, tables);
};


/*!
 * Get number of rows in a table
 * @param <String>
 * @return <Number>
 */
RethinkDBClient.prototype.getNumberOfRows = function (tableName) {
  return r.table(tableName).count().run(this.conn);
};

/*!
 * Get rows from a collection
 * @param <String>
 * @param <Number>
 * @param <Number>
 * @return <Promise> --> <Array>
 */
RethinkDBClient.prototype.getRows = function (tableName, numberOfRows, offset) {
  return r.table(tableName).skip(offset).limit(numberOfRows)
    .coerceTo('array')
    .run(this.conn);
};

/*!
 * Insert rows into a collection
 * @param <String>
 * @param <Array>
 * @return <Promise>
 */
RethinkDBClient.prototype.insertRows = function (rows) {
  return r.table(tableName).insert(rows).run(this.conn);
};

module.exports = RethinkDBClient;
