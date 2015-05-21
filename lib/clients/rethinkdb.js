var r = require('rethinkdb');
var q = require('q');
var checkType = require('../check-type');
require('rethinkdb-init')(r);

var RethinkDBClient  = function (connectionOpts, opts) {
  checkType(opts.sourceOrTarget, { types: 'string', values: ['source', 'target'] });
  this.connectionOpts = connectionOpts;
  this.direction = opts.sourceOrTarget;
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
      return r.dbList().run(this.conn)
        .then(function (dbList) {
          var dbExists = dbList.indexOf(this.connectionOpts.db) !== -1;
          if (dbExists && this.direction === 'target') {
            throw new Error('Target database should not exist. It will be created automatically during import.');
          }
          if (!dbExists && this.direction === 'source') {
            throw new Error('Source database does not exist.');
          }
        }.bind(this));
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
        return r.table(table).config().run(this.conn)
          .then(function (tableConfig) {
            return {
              name: table,
              primaryIndex: tableConfig.primary_key
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
RethinkDBClient.prototype.createTables = function (tables) {
  return r.init(this.connectionOpts, tables);
};


/*!
 * Get number of rows in a table
 * @param <String>
 * @return <Number>
 */
RethinkDBClient.prototype.getNumberOfRows = function (tableConfig) {
  return r.table(tableConfig.name).count().run(this.conn);
};

/*!
 * Get rows from a collection
 * @param <String>
 * @param <Number>
 * @param <Number>
 * @return <Promise> --> <Array>
 */
RethinkDBClient.prototype.getRows = function (tableConfig, numberOfRows, offset) {
  return r.table(tableConfig.name)
    .orderBy('id')
    .skip(offset)
    .limit(numberOfRows)
    .coerceTo('array')
    .run(this.conn);
};

/*
 * Map row to be imported from another database into RethinkDB
 * @param <Object>
 * @return <Object>
 */
RethinkDBClient.prototype.mapImportedRow = function (row) {
  return row;
};

/*
 * Map row to be export from RethinkDB into another database
 * @param <Object>
 * @return <Object>
 */
RethinkDBClient.prototype.mapExportedRow = function (row) {
  return row;
};

/*!
 * Insert rows into a collection
 * @param <String>
 * @param <Array>
 * @return <Promise>
 */
RethinkDBClient.prototype.insertRows = function (tableConfig, rows) {
  // This is what will map the `_id` from Mongo into RethinkDB `id`
  return r.table(tableConfig.name).insert(rows).run(this.conn);
};

module.exports = RethinkDBClient;
