var _ = require('lodash');
var checkType = require('check-type');

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
    append: false,
  });

  // Type Validation
  checkType(opts.db, ['string', 'undefined', 'null']);
  checkType(opts.source, 'string', 'opts.source');
  checkType(opts.target, 'string', 'opts.target');
  checkType(opts.rethinkdb, 'object', 'opts.rethinkdb');
  checkType(opts.rethinkdb.host, 'string', 'opts.rethinkdb.host');
  checkType(opts.rethinkdb.port, 'number', 'opts.rethinkdb.port');
  checkType(opts.rethinkdb.db, ['string', 'undefined']);
  checkType(opts.mongo, 'object', 'opts.mongo');
  checkType(opts.mongo.host, 'string', 'opts.mongo.host');
  checkType(opts.mongo.port, 'number', 'opts.mongo.port');
  checkType(opts.mongo.db, ['string', 'undefined']);
  checkType(opts.collection, ['boolean', 'array']);
  checkType(opts.convertId, 'boolean');
  checkType(opts.append, 'boolean');

  // More Specific Input Validation
  // If `collections` is an array, it must have at least one value
  if (Array.isArray(opts.collections) && opts.collections.length === 0) {
    throw new Error('opts.collections must have at least one collection/table specified');
  }
  // `from` must be either `mongo` or `rethinkdb`
  if (opts.from !== 'mongo' && opts.to !== 'rethinkdb') {
    throw new Error('`from` field must be either `mongo` or `rethinkdb`');
  }
  // Check for DB attribute
  if (opts.db === undefined && (opts.rethinkdb.db === undefined || opts.mongo.db === undefined)) {
    throw new Error('If no `db` property is specified, a `db` property must be specified for both MongoDB and Rethinkdb.');
  }
  if (opts.source === opts.target) {
    throw new Error('`source` and `target` cannot be the same');
  }
  return opts;
};
