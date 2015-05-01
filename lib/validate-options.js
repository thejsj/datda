var _ = require('lodash');

var checkType = function (types, name, value) {
  if (typeof types === 'string') types = [types];
  for (var i = 0; i < types.length; i += 1) {
    if (types[i] === 'array') {
      if (Array.isArray(value)) return true;
    } else if (types[i] === 'null') {
      if (value === null) return true;
    } else {
      if (typeof value === types[i]) return true;
    }
  }
  throw new TypeError('Variable with name `' + name  + '` of value `' + value + '` is expected to be a `' + types + '`');
};

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
  checkType(['string', 'undefined', 'null'], 'opts.db', opts.db);
  checkType('string', 'opts.source', opts.source);
  checkType('string', 'opts.target', opts.target);
  checkType('object', 'opts.rethinkdb', opts.rethinkdb);
  checkType('string', 'opts.rethinkdb.host', opts.rehtinkdb.host);
  checkType('number', 'opts.rethinkdb.port', opts.rehtinkdb.port);
  checkType(['string', 'undefined'], 'opts.rethinkdb.db', opts.rehtinkdb.db);
  checkType('object', 'opts.mongo', opts.mongo);
  checkType('string', 'opts.mongo.host', opts.mongo.host);
  checkType('number', 'opts.mongo.port', opts.mongo.port);
  checkType(['string', 'undefined'], 'opts.mongo.db', opts.mongo.db);
  checkType(['boolean', 'array'], 'opts.collections', opts.collections);
  checkType('boolean', 'opts.convertId', opts.convertId);
  checkType('boolean', 'opts.append', opts.append);

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
