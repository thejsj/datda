var _ = require('lodash');
var q = require('q');
var valideteOptions = require('./validate-options');

var motore = function (options) {
  // 1. Validate Options
  options = validateOptions(options);
  // 2. Instanstiate Drivers
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
      // 3. Connect to Both Databases
      return sourceDB.connect()
        .then(function () {
          return targetDB.connect();
        });
    })
    .then(function () {
      // 4. Get a list of tables from the source database (if `collections` is not defined)/Create Tables in target database
      return sourceDB.getTables()
        .then(function (tables) {
          return targetDB.createTables(tables)
            .then(function () {
              return q.all(tables.map(function (tableConfig) {
                return sourceDB.getRows(tableConfig);
                  .then(function (numberOfRows) {
                    console.log('NumberOfRows', numberOfRows);
                      // 5. Start recursive importing
                      // TODO: Add recursive importing...
                      // 6. Finish Operation
                      // TODO: Get Metadata object
                  });
              }));
            })
        });
    });
};

module.exports = motore;
