var Promise = require('bluebird');
var mongo = Promise.promisifyAll(require('mongodb').MongoClient);
var q = require('q');
var _ = require('lodash');
var checkType = require('../check-type');

var MongoDriver = function (connectionOpts, opts) {
  checkType(opts.sourceOrTarget, { types: ['string'], values: ['source', 'target'] });
  var c = this.connectionOpts = connectionOpts;
  this.connectionURL = 'mongodb://' + c.host + ':' + c.port + '/' + c.db;
  this.direction = opts.sourceOrTarget;
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

      listDatabases = new Promise(function (resolve, reject) {
        this.db.admin().listDatabases(function (err, results) {
          if (err) reject(err);
          resolve(results);
        });
      }.bind(this));

      return listDatabases
        .then(function (result) {
          var dbList = _.pluck(result.databases, 'name');
          var dbExists = (dbList.indexOf(this.connectionOpts.db) !== -1);
          if (dbExists && this.direction === 'target') {
            throw new Error('Target database should not exist. It will be created automatically during import.');
          }
          if (!dbExists && this.direction === 'source') {
            throw new Error('Source database does not exist or has no collections.');
          }
        }.bind(this));
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
            // NOTE: In MongoDB, there is only one type of primary index
            // which is the _id. `_id`s are automatically created when
            // not specified and no other property can server as the
            // primary key.
            //
            // When creating the tables object with the primary index,
            // we're just going to make sure our `indexes` property has
            // the `_id` property. If it doesn't we'lll throw an error.
            var primaryIndex = _.filter(indexes, function (row) { return row.name === '_id_'; });
            var secondaryIndexes = _.filter(indexes, function (row) { return row.name !== '_id_'; });
            if (primaryIndex.length === 0 || !primaryIndex[0].key.hasOwnProperty('_id')) {
              console.log('indexes');
              console.log(indexes);
              console.log('primary');
              console.log(primaryIndex);
              throw new Error('Mongo Colleciton with name `' + coll.s.name + '` doesn\'t have a primary index `_id`.');
            }
            // NOTE: This might not be a correct mapping of secondary indexes
            secondaryIndexes = secondaryIndexes.map(function (index) {
              return {
                name: index.name.split('_')[0],
                type: index.key._fts
              };
            });
            return {
              name: coll.s.name,
              primaryIndex: '_id',
              secondaryIndexes: secondaryIndexes
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
MongoDriver.prototype.createTables = function (collections) {
  return q()
    .then(function () {
      if (!Array.isArray(collections)) throw new TypeError('`tables` object must be an array');
      collections.forEach(function (collection) {
        if (typeof collection.name !== 'string') throw new TypeError('`name` property in table must be a string');
      });
      return q.all(collections.map(function (collection) {
        if (collection.primaryKey !== undefined && collection.primaryKey !== '_id') {
          throw new Error('`primaryKey` that is not `_id` passed for MongoDB collection. MongoDB only supports `_id` as a primary key.');
        }
        // TODO: Add indexes
        return this.db.createCollectionAsync(collection.name);
      }.bind(this)));
    }.bind(this));
};

/*!
 * Get number of rows in a table
 * @param <String>
 * @return <Number>
 */
MongoDriver.prototype.getNumberOfRows = function (collectionConfig) {
  return this.db.collectionAsync(collectionConfig.name)
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
MongoDriver.prototype.getRows = function (collectionConfig, numberOfRows, offset) {
  return this.db.collectionAsync(collectionConfig.name)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.find()
        .limit(numberOfRows)
        .skip(offset);
    })
    .then(function (cursor) {
      cursor = Promise.promisifyAll(cursor);
      return cursor.toArrayAsync();
    });
};

/*!
 * Insert rows into a collection
 * @param <String>
 * @param <Array>
 * @return <Promise>
 */
MongoDriver.prototype.insertRows = function (collectionConfig, rows) {
  return this.db.collectionAsync(collectionConfig.name)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.insert(rows);
    });
};

module.exports = MongoDriver;
