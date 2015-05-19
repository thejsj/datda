var _ = require('lodash');
var checkType = require('./check-type');

/*!
 * Check the `otps` object and make sure all parameters are valid and correct
 * @param <Object>
 * @return <Object>
 */
var validateInput = function (opts) {
  /*!
   * Defaults and Type Validation
   */
  if (typeof opts.mongo === 'object') {
    opts.mongo = _.defaults(opts.mongo, {
      host: 'localhost',
      port: 27017,
    });
  }
  if (typeof opts.rethinkdb === 'object') {
    opts.rethinkdb = _.defaults(opts.rethinkdb, {
      host: 'localhost',
      port: 28015,
    });
  }
  opts = _.defaults(opts, {
    source: 'mongo',
    target: 'rethinkdb',
    collections: false,
    convertId: false,
    rowsPerBatch: 10000,
    append: false,
    log: false
  });

  // Type Validation
  checkType(opts.db, ['string', 'undefined', 'null']);
  checkType(opts.source, 'string', 'opts.source');
  checkType(opts.target, 'string', 'opts.target');
  checkType(opts.rethinkdb, 'object', 'opts.rethinkdb');
  checkType(opts.rethinkdb.host, 'string', 'opts.rethinkdb.host');
  checkType(opts.rethinkdb.port, 'number', 'opts.rethinkdb.port');
  checkType(opts.rethinkdb.db, ['string', 'undefined', 'null']);
  checkType(opts.mongodb, 'object', 'opts.mongodb');
  checkType(opts.mongodb.host, 'string', 'opts.mongodb.host');
  checkType(opts.mongodb.port, 'number', 'opts.mongodb.port');
  checkType(opts.mongodb.db, ['string', 'undefined', 'null']);
  checkType(opts.collection, ['undefined', 'boolean', 'array', 'null']);
  checkType(opts.convertId, 'boolean');
  checkType(opts.append, 'boolean');
  checkType(opts.rowsPerBatch, 'number');
  checkType(opts.log, 'boolean');

  // More Specific Input Validation
  // If `collections` is an array, it must have at least one value
  if (Array.isArray(opts.collections) && opts.collections.length === 0) {
    throw new Error('opts.collections must have at least one collection/table specified');
  }
  // `source` must be either `mongo` or `rethinkdb`
  if (opts.source !== 'mongodb' && opts.source !== 'rethinkdb') {
    throw new Error('`source` field must be either `mongodb` or `rethinkdb`');
  }
  // `target` must be either `mongo` or `rethinkdb`
  if (opts.target !== 'mongodb' && opts.target !== 'rethinkdb') {
    throw new Error('`target` field must be either `mongodb` or `rethinkdb`');
  }
  // Check for DB attribute
  if (opts.db === undefined && (opts.rethinkdb.db === undefined || opts.mongo.db === undefined)) {
    throw new Error('If no `db` property is specified, a `db` property must be specified for both MongoDB and Rethinkdb.');
  }
  if ((!opts.rethinkdb.db || !opts.rethinkdb.db) && opts.db) {
    opts.rethinkdb.db = opts.db;
  }
  if ((!opts.mongodb.db || !opts.mongodb.db) && opts.db) {
    opts.mongodb.db = opts.db;
  }
  if (opts.source === opts.target) {
    throw new Error('`source` and `target` cannot be the same');
  }
  return opts;
};

module.exports = validateInput;
