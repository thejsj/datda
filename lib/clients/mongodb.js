var Promise = require('bluebird');
var mongo = Promise.promisifyAll(require('mongodb').MongoClient);
var _ = require('lodash');
var checkType = require('../check-type');

var MongoDBDriver = function (connectionOpts, opts) {
  checkType(opts.sourceOrTarget, { types: ['string'], values: ['source', 'target'] });
  var c = this.connectionOpts = connectionOpts;
  this.connectionURL = 'mongodb://' + c.host + ':' + c.port + '/' + c.db;
  this.direction = opts.sourceOrTarget;
};

/*!
 * Connect to the Mongo Database
 * @return <Promise>
 */
MongoDBDriver.prototype.connect = function () {
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
MongoDBDriver.prototype.closeConnection = function () {
  return Promise.resolve()
    .then(function () {
      this.db.close();
    }.bind(this));
};

/*!
 * Get all collections/tables in a database
 * @return <Promise>
 */
MongoDBDriver.prototype.getTables = function () {
  return this.db.collectionsAsync()
    .then(function (collections){
      var colls = collections
        .filter(function (coll) {
          return coll.s.name !== 'system.indexes';
        });
      return Promise.all(colls.map(function (coll) {
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
            var primaryKey = _.filter(indexes, function (row) { return row.name === '_id_'; });
            var secondaryIndexes = _.filter(indexes, function (row) { return row.name !== '_id_'; });
            if (primaryKey.length === 0 || !primaryKey[0].key.hasOwnProperty('_id')) {
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
              primaryKey: '_id',
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
MongoDBDriver.prototype.createTables = function (collections) {
  var p = Promise.resolve(true)
    .then(function () {
      if (!Array.isArray(collections)) {
        throw new TypeError('`tables` object must be an array');
      }
      collections.forEach(function (collection) {
        if (typeof collection.name !== 'string') {
          throw new TypeError('`name` property in table must be a string');
        }
      });
      return Promise.all(collections.map(function (collection) {
        if (collection.primaryKey !== undefined && collection.primaryKey !== '_id') {
          // NOTE: This driver's property mapping function takes care of
          // changing the documents's/row's properties to `_id`
          //throw new Error('`primaryKey` that is not `_id` passed for MongoDB collection. MongoDB only supports `_id` as a primary key.');
        }
        // TODO: Add indexes
        return this.db.createCollectionAsync(collection.name);
      }.bind(this)));
    }.bind(this));
  return p;
};

/*!
 * Get number of rows in a table
 * @param <String>
 * @return <Number>
 */
MongoDBDriver.prototype.getNumberOfRows = function (collectionConfig) {
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
MongoDBDriver.prototype.getRows = function (collectionConfig, numberOfRows, offset) {
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
 * Map row to be imported from another database into RethinkDB
 * @param <Object>
 * @returns <Object>
 */
MongoDBDriver.prototype.mapExportedRow = function (tableConfig, row) {
  row._id = row._id.toString();
  // If there is not `id`
  row.id = row._id;
  delete row._id;
  return row;
};

/*
 * Map row to be imported from another database into RethinkDB
 * @param <Object>
 * @return <Object>
 */
MongoDBDriver.prototype.mapImportedRow = function (tableConfig, row) {
  // If there is no `_id`
  row._id = row[tableConfig.primaryKey];
  delete row[tableConfig.primaryKey];
  return row;
};

/*!
 * Insert rows into a collection
 * @param <String>
 * @param <Array>
 * @return <Promise>
 */
MongoDBDriver.prototype.insertRows = function (collectionConfig, rows) {
  return this.db.collectionAsync(collectionConfig.name)
    .then(function (coll) {
      coll = Promise.promisifyAll(coll);
      return coll.insert(rows);
    });
};

module.exports = MongoDBDriver;
