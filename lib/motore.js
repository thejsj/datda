var _ = require('lodash');
var q = require('q');
var valideteOptions = require('./validate-options');

var motore = {

  import: function (options) {
    // 1. Validate Options
    options = validateOptions(options);
    var sourceDB = (function () {
      if (options.source === 'rethinkdb') return new RethinkDBClient(options.rethinkdb);
      if (options.source === 'mongo') return new MongoClient(options.mongo);
    }());
    var targetDB = (function () {
      if (options.from === 'rethinkdb') return new RethinkDBClient(options.rethinkdb);
      if (options.from === 'mongo') return new MongoClient(options.mongo);
    }());

    // Return a promise
    return q()
      .then(function () {
        // 2. Connect to Both Databases
        return sourceDB.connect()
          .then(function () {
            return targetDB.connect();
          });
      })
      .then(function () {
        // 3. Get a list of tables from the source database (if `collections` is not defined)/Create Tables in target database
        return sourceDB.getTables()
          .then(function (tables) {
            return targetDB.createTables(tables);
          });
      })
      .then(function () {
        // 4. (Possible?) Get Indexes from source table/Create indexes in target tables
        return sourceDB.getIndexes()
          .then(function (indexes) {
            return targetDB.createIndexes(indexes);
          });
      })
      .then(function () {
        // 5. Start recursive importing
        // TODO: Add recursive importing...
      })
      .then(function () {
        // 6. Finish Operation
        // TODO: Get Metadata object
        return true;
      });
 }

};

module.exports = motore;
